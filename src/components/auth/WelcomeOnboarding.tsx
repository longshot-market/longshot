import DashboardPreview from "./DashboardPreview";
import WelcomeFlow from "./WelcomeFlow";

// Onboarding step 2: a blurred analytics dashboard behind a mandatory modal.
// The modal walks the user through linking their Polymarket account and then a
// short questionnaire — so it feels like they're already inside the product.
export default function WelcomeOnboarding() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Blurred analytics behind the modal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none blur-[6px] opacity-70 dark:opacity-50"
      >
        <DashboardPreview />
      </div>
      <div aria-hidden className="absolute inset-0 bg-zinc-50/70 dark:bg-black/60" />

      {/* The modal. */}
      <div className="relative z-10 flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <WelcomeFlow />
        </div>
      </div>
    </main>
  );
}
