import { redirect } from "next/navigation";
import type { Metadata } from "next";
import WelcomeOnboarding from "@/components/auth/WelcomeOnboarding";
import { SUPABASE_CONFIGURED } from "@/lib/supabase/config";
import { getPrimaryAccount, getUser } from "@/lib/auth";
import { BRAND } from "@/config/brand";

export const metadata: Metadata = { title: `Welcome · ${BRAND.name}` };

// Post-signup account linking. Requires a session; a user who already linked an
// account is sent straight to their tracker.
export default async function WelcomePage() {
  if (!SUPABASE_CONFIGURED) redirect("/");
  const user = await getUser();
  if (!user) redirect("/");
  const acct = await getPrimaryAccount();
  if (acct) {
    redirect(`/t/${encodeURIComponent(acct.username ?? acct.wallet ?? acct.input)}`);
  }
  return <WelcomeOnboarding />;
}
