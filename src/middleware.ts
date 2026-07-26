import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURED, SUPABASE_URL } from "@/lib/supabase/config";

// Refreshes the Supabase session on each request so Server Components see a
// current auth state. It does NOT gate any route — access is additive; the
// public tracker and Discovery stay open to everyone.
//
// Uses the classic `middleware.ts` convention (Edge runtime) rather than Next
// 16's `proxy.ts`, because proxy always runs on the Node runtime which the
// OpenNext Cloudflare adapter can't execute yet. Revisit when it supports it.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!SUPABASE_CONFIGURED) return response;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the session so expired tokens get refreshed into cookies.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Run on everything except static assets and image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
