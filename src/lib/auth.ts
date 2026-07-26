import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string | null;
  subscription_type: "free" | "paid";
}

export interface LinkedAccount {
  id: string;
  input: string;
  wallet: string | null;
  username: string | null;
  is_primary: boolean;
}

/** The signed-in auth user, or null (also null when Supabase isn't configured). */
export async function getUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, email, subscription_type")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function getPrimaryAccount(): Promise<LinkedAccount | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("linked_accounts")
    .select("id, input, wallet, username, is_primary")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();
  return (data as LinkedAccount) ?? null;
}
