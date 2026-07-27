import { Resend } from "resend";

const SITE = "https://longshot.market";
const LINK = "color: #2563eb; font-weight: 700; text-decoration: none;";

const banner = `
<div style="padding: 4px 0 0 0; margin-bottom: 20px;">
  <a href="${SITE}"><img src="${SITE}/longshot-wordmark-dark.png" alt="Longshot" height="77" width="161" style="display: block; border: 0;" /></a>
</div>`;

const footer = `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
  <a href="https://x.com/longshot_market" style="text-decoration: none; margin-right: 14px;"><img src="${SITE}/social/x.png" alt="X" width="18" height="18" style="vertical-align: middle; border: 0;" /></a>
  <a href="https://github.com/hsantana/longshot" style="text-decoration: none; margin-right: 14px;"><img src="${SITE}/social/github.png" alt="GitHub" width="18" height="18" style="vertical-align: middle; border: 0;" /></a>
  <a href="${SITE}" style="text-decoration: none;"><img src="${SITE}/social/longshot.png" alt="Longshot" width="19" height="19" style="vertical-align: middle; border: 0;" /></a>
</div>`;

/** One-time welcome, sent after a user verifies their email for the first time. */
export async function sendWelcomeEmail(to: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Kaloh from Longshot <hi@longshot.market>",
    replyTo: "hi@longshot.market",
    to,
    bcc: "hi@longshot.market",
    subject: "Welcome to Longshot!",
    html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.7; color: #222; max-width: 520px; margin: 0 auto; padding: 16px;">
${banner}

<p>Welcome to Longshot!</p>

<p>I'm Kaloh. I built Longshot to help you study your Polymarket strategy and performance, in one clean place.</p>

<p>Here's what you can do:</p>

<ul style="margin: 0 0 16px; padding-left: 22px;">
<li style="margin-bottom: 6px;"><strong>Performance</strong>: your realized and unrealized PnL, win rate, and how every play paid off.</li>
<li style="margin-bottom: 6px;"><strong>Portfolio</strong>: your open positions, exposure, and net worth over time.</li>
<li><strong>Discovery</strong>: filter markets and plays to suit your strategy.</li>
</ul>

<p><strong>P.S. What brought you here? Just hit reply, I read every email.</strong></p>

<p><a href="https://x.com/kaloh_xyz" style="${LINK}">Kaloh</a><br>Longshot</p>
${footer}
</div>`,
  });
}
