// Supabase connection config, read from public env at build time. Both values
// are safe to expose (the anon key is protected by RLS). When either is absent
// the whole auth layer no-ops so the public tracker still runs for forks.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
