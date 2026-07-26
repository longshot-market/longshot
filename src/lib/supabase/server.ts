import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURED, SUPABASE_URL } from "./config";

/**
 * Server Supabase client bound to the request's cookies. Returns null when
 * Supabase isn't configured so callers can degrade gracefully. The cookie
 * writes are wrapped in try/catch because Server Components can't set cookies —
 * the middleware handles session refresh there.
 */
export async function createClient() {
  if (!SUPABASE_CONFIGURED) return null;
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      },
    },
  });
}
