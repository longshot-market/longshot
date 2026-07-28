# Longshot

Open-source performance tracker for [Polymarket](https://polymarket.com) traders.

Enter any Polymarket username or wallet address and see that account's open positions, closed positions, and PnL (realized, unrealized, and per-position). All data is public and read-only — no login, no wallet connection, no API keys.

## How it works

Longshot is a Next.js app whose server routes call Polymarket's public APIs:

- **Gamma API** (`gamma-api.polymarket.com`) — profile search (username → wallet address)
- **Data API** (`data-api.polymarket.com`) — open/closed positions and portfolio value
- **Leaderboard API** (`lb-api.polymarket.com`) — all-time realized profit

Requests run server-side (not from the browser) so lookups are shielded from CORS changes and can be cached at the edge.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables or secrets are required.

## Optional integrations

Both are off by default — with no env vars set, the code no-ops and the public tracker works unchanged. Copy `.env.example` to `.env.local` and fill in what you need; that file documents each variable and its secret-handling rules.

- **[PostHog](https://posthog.com)** analytics — set `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST`. `NEXT_PUBLIC_*` vars are inlined at build time, so they must be set wherever `npm run deploy` builds.
- **[Supabase](https://supabase.com)** email accounts (6-digit OTP + a linked Polymarket account) — set the `SUPABASE_*` vars and run [`supabase/migrations/0001_auth_schema.sql`](supabase/migrations/0001_auth_schema.sql). For the OTP code email, configure custom SMTP in Supabase and include `{{ .Token }}` in the template.

## Self-hosting

The app deploys anywhere Next.js runs. The included config targets Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare):

```bash
npm run deploy    # builds with opennextjs-cloudflare and deploys with wrangler
```

You'll need a Cloudflare account with `wrangler` authenticated (`npx wrangler login`, or `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`). Edit `wrangler.jsonc` to change the worker name or custom domain.

## Contributing

Not accepting external contributions yet (early v1). Bug reports and feature requests are welcome as [issues](https://github.com/longshot-market/longshot/issues). When contributions open, they're accepted under the same MIT License ("inbound = outbound").

## License and branding

Source code is under the [MIT License](LICENSE). The Longshot name, logo, and wordmark are **not** — see [TRADEMARKS.md](TRADEMARKS.md). Forks must use distinct branding; the name and wordmark are centralized in [`src/config/brand.ts`](src/config/brand.ts) for easy rebranding.

Copyright (c) 2026 Hugo Santana.
