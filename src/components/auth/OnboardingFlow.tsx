"use client";

// Email → 6-digit OTP. On success: a returning user with an account linked goes
// straight to their tracker; a new user goes to /welcome to link one.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorClass, inputClass, linkBtn, primaryBtn } from "./ui";

type Step = "email" | "otp";

export default function OnboardingFlow({ onDone }: { onDone?: () => void }) {
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
      <form onSubmit={sendCode} className="space-y-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className={inputClass}
        />
        {error && <p className={errorClass}>{error}</p>}
        <button type="submit" disabled={busy} className={`${primaryBtn} text-[0.9625rem]`}>
          {busy ? "Sending…" : "Join Longshot"}
        </button>
      </form>
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
