"use client";

// Onboarding questionnaire (two single-select questions), shown on /welcome
// right after the user links a Polymarket account. Each question is skippable
// on its own; the "other" option reveals a validated free-text field. All
// answers are written once, at the end, to the survey_responses table.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorClass, inputClass, linkBtn, primaryBtn } from "./ui";

type Choice = { value: string; label: string };

const FRUSTRATIONS: Choice[] = [
  { value: "performance", label: "Understanding my true performance" },
  { value: "strategies", label: "Knowing which strategies work" },
  { value: "risk", label: "Tracking risk and exposure" },
  { value: "markets", label: "Finding worthwhile markets" },
  { value: "traders", label: "Analyzing other traders" },
  { value: "manual_work", label: "Too much manual work" },
  { value: "other", label: "Something else" },
];

const REFERRALS: Choice[] = [
  { value: "ai_search", label: "AI search — Claude, ChatGPT, Perplexity, Copilot…" },
  { value: "google", label: "Google" },
  { value: "x", label: "X (Twitter)" },
  { value: "reddit", label: "Reddit" },
  { value: "friend", label: "Through a friend" },
  { value: "community", label: "Group or community chat" },
  { value: "other", label: "Other" },
];

// "No weird characters": letters (any language), numbers, whitespace, and a
// small set of everyday punctuation. Also caps length. Empty is not valid here
// (an empty "other" can't be submitted — the user skips instead).
const OTHER_RE = /^[\p{L}\p{N}\s.,'&/()!?-]{1,120}$/u;
const isValidOther = (s: string) => OTHER_RE.test(s.trim());

function OptionList({
  options,
  value,
  onSelect,
}: {
  options: Choice[];
  value: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
              selected
                ? "border-zinc-900 bg-zinc-50 text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100"
                : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                selected
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-300 dark:border-zinc-600"
              }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />}
            </span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function SurveyForm({ handle }: { handle: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [step, setStep] = useState(0); // 0 = frustration, 1 = referral
  const [frustration, setFrustration] = useState<string | null>(null);
  const [frustrationOther, setFrustrationOther] = useState("");
  const [referral, setReferral] = useState<string | null>(null);
  const [referralOther, setReferralOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToTracker = () => {
    router.push(`/t/${encodeURIComponent(handle)}`);
    router.refresh();
  };

  async function submit(referralValue: string | null, referralOtherValue: string) {
    setBusy(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      return setError("Your session expired — please sign in again.");
    }
    const { error } = await supabase.from("survey_responses").upsert({
      user_id: user.id,
      frustration,
      frustration_other: frustration === "other" ? frustrationOther.trim() : null,
      referral_source: referralValue,
      referral_source_other: referralValue === "other" ? referralOtherValue.trim() : null,
    });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    goToTracker();
  }

  const isLast = step === 1;
  const value = isLast ? referral : frustration;
  const otherText = isLast ? referralOther : frustrationOther;
  const otherInvalid =
    value === "other" && otherText.trim().length > 0 && !isValidOther(otherText);
  const canContinue = value !== null && (value !== "other" || isValidOther(otherText));

  function onPrimary() {
    if (!canContinue) return;
    if (!isLast) {
      setError(null);
      setStep(1);
    } else {
      void submit(referral, referralOther);
    }
  }

  function onSkip() {
    setError(null);
    if (!isLast) {
      setFrustration(null);
      setFrustrationOther("");
      setStep(1);
    } else {
      // Skip the last question: submit with no referral answer.
      void submit(null, "");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-400">
          Question {step + 1} of 2
        </p>
        <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {isLast ? "How did you hear about us?" : "What's your biggest frustration today?"}
        </h2>
      </div>

      <div className="space-y-3">
        <OptionList
          options={isLast ? REFERRALS : FRUSTRATIONS}
          value={value}
          onSelect={(v) => {
            setError(null);
            if (isLast) setReferral(v);
            else setFrustration(v);
          }}
        />
        {value === "other" && (
          <div>
            <input
              type="text"
              autoFocus
              maxLength={120}
              value={otherText}
              onChange={(e) =>
                isLast ? setReferralOther(e.target.value) : setFrustrationOther(e.target.value)
              }
              placeholder="Tell us more"
              spellCheck={false}
              className={inputClass}
            />
            {otherInvalid && (
              <p className={`${errorClass} mt-1.5`}>
                Please use only letters, numbers, and basic punctuation.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className={errorClass}>{error}</p>}

      <div className="space-y-2">
        <button
          type="button"
          onClick={onPrimary}
          disabled={busy || !canContinue}
          className={`${primaryBtn} text-sm`}
        >
          {busy ? "Saving…" : isLast ? "Finish" : "Continue"}
        </button>
        <button type="button" onClick={onSkip} disabled={busy} className={linkBtn}>
          Skip
        </button>
      </div>
    </div>
  );
}
