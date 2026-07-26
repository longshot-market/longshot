import { redirect } from "next/navigation";
import SearchBox from "@/components/SearchBox";
import Wordmark from "@/components/Wordmark";
import ThemeToggle from "@/components/ThemeToggle";
import OnboardingFlow from "@/components/auth/OnboardingFlow";
import AuthButtons from "@/components/auth/AuthButtons";
import { BRAND } from "@/config/brand";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";
import { getPrimaryAccount, getUser } from "@/lib/auth";

// Split the tagline so "Polymarket" can carry a subtle brand-blue gradient;
// falls back to the plain string if the word ever changes in brand.ts.
function Tagline({ text }: { text: string }) {
  const parts = text.split(/(Polymarket)/);
  return (
    <>
      {parts.map((part, i) =>
        part === "Polymarket" ? (
          <span
            key={i}
            className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text font-medium text-transparent"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default async function Home() {
  // When auth is configured, the landing is signup-first. A logged-in user with
  // a linked account goes to their tracker; one without goes to /welcome to link
  // it. Forks without Supabase keep the original public search box.
  const authed = SUPABASE_CONFIGURED;
  if (authed) {
    const user = await getUser();
    if (user) {
      const acct = await getPrimaryAccount();
      redirect(
        acct
          ? `/t/${encodeURIComponent(acct.username ?? acct.wallet ?? acct.input)}`
          : "/welcome"
      );
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6">
      <div className="flex items-center justify-end gap-2 py-4">
        <AuthButtons />
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center pb-24 text-center">
        <h1>
          <Wordmark className="mx-auto h-[144px]" />
        </h1>
        <p className="mt-4 text-[1.46rem] text-zinc-500 dark:text-zinc-400 lg:whitespace-nowrap lg:text-[1.606rem]">
          <Tagline text={BRAND.tagline} />
        </p>
        <div className="mx-auto mt-10 w-full max-w-md text-left">
          {authed ? <OnboardingFlow /> : <SearchBox autoFocus />}
        </div>
      </div>
    </main>
  );
}
