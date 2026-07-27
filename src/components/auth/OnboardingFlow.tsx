"use client";

// Email → 6-digit OTP. On success: a returning user with an account linked goes
// straight to their tracker; a new user goes to /welcome to link one.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandIcon from "@/components/BrandIcon";
import { errorClass, inputClass, linkBtn, primaryBtn } from "./ui";

type Step = "email" | "otp";

// `branded` shows the centered logo + heading (used in the modal). The inline
// landing usage leaves it off, since the page already carries the big wordmark.
export default function OnboardingFlow({
  onDone,
  branded = false,
}: {
  onDone?: () => void;
  branded?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setCode("");
    setStep("otp");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    if (error) {
      setBusy(false);
      return setError("That code is invalid or expired — try again.");
    }
    // Fire-and-forget welcome email; the API guards against sending twice.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      void fetch("/api/welcome", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {});
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: acct } = await supabase
      .from("linked_accounts")
      .select("username, wallet, input")
      .eq("user_id", user!.id)
      .eq("is_primary", true)
      .maybeSingle();
    setBusy(false);
    onDone?.();
    if (acct) {
      router.push(`/t/${encodeURIComponent(acct.username ?? acct.wallet ?? acct.input)}`);
    } else {
      router.push("/welcome");
    }
    router.refresh();
  }

  if (step === "email") {
    return (
      <div className="space-y-5">
        {branded && (
          <div className="flex flex-col items-center text-center">
            <BrandIcon className="h-12 w-12" />
            <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              What&rsquo;s your email address?
            </h2>
          </div>
        )}
        <form onSubmit={sendCode} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={branded ? "Enter your email address…" : "you@email.com"}
            autoComplete="email"
            className={inputClass}
          />
          {error && <p className={errorClass}>{error}</p>}
          <button type="submit" disabled={busy} className={`${primaryBtn} text-[0.9625rem]`}>
            {busy ? "Sending…" : "Join Longshot"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={verifyCode} className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Enter your code</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          We sent a code to{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-200">{email}</span>.
        </p>
      </div>
      <input
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={8}
        required
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="Enter code"
        className={`${inputClass} text-center text-2xl font-semibold tracking-[0.4em]`}
      />
      {error && <p className={errorClass}>{error}</p>}
      <button type="submit" disabled={busy || code.length < 6} className={`${primaryBtn} text-sm`}>
        {busy ? "Verifying…" : "Verify"}
      </button>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setStep("email");
        }}
        className={linkBtn}
      >
        Use a different email
      </button>
    </form>
  );
}
