import { createClient } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/emails/welcome";

// Sends the welcome email exactly once per user. The client calls this after a
// successful first OTP verification, passing the session access token. The
// `welcome_sent` flag on the auth user's metadata guards against repeats.
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !process.env.RESEND_API_KEY) {
    return Response.json({ error: "Email not configured" }, { status: 501 });
  }

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(url, serviceKey);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);
  if (authError || !user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.user_metadata?.welcome_sent) {
    return Response.json({ ok: true, skipped: "already_welcomed" });
  }

  // Claim the send first so a racing request can't double-send, then email.
  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, welcome_sent: true },
  });

  try {
    await sendWelcomeEmail(user.email);
  } catch (err) {
    // Roll back the flag so a retry can send it.
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, welcome_sent: false },
    });
    console.error("Welcome email failed:", err);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
