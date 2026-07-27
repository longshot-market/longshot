"use client";

// The /welcome modal content: link a Polymarket account, then answer the
// onboarding questionnaire, then land on the tracker. Linking is required;
// each survey question is individually skippable (handled in SurveyForm).

import { useState } from "react";
import AccountLinkForm from "./AccountLinkForm";
import SurveyForm from "./SurveyForm";

export default function WelcomeFlow() {
  const [step, setStep] = useState<"link" | "survey">("link");
  const [handle, setHandle] = useState("");

  if (step === "survey") return <SurveyForm handle={handle} />;

  return (
    <div>
      <h2 className="text-lg font-semibold">Link your Polymarket account</h2>
      <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Enter a Polymarket username or wallet to see your performance.
      </p>
      <AccountLinkForm
        onLinked={(h) => {
          setHandle(h);
          setStep("survey");
        }}
      />
    </div>
  );
}
