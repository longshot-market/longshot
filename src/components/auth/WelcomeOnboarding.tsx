import AccountLinkForm from "./AccountLinkForm";
import DashboardPreview from "./DashboardPreview";

// Onboarding step 2: a blurred analytics dashboard behind a mandatory modal
// asking for the user's Polymarket account — so it feels like they're already
// inside the product.
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
          <h2 className="text-lg font-semibold">Link your Polymarket account</h2>
          <p className="mb-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Enter a Polymarket username or wallet to see your performance.
          </p>
          <AccountLinkForm />
        </div>
      </div>
    </main>
  );
}
