# Minilab Strada deployment

This fork supports the Minilab deployment at `strada.d6e.us`. The website and
OpenTelemetry ingester run as Cloudflare Workers. Preview uses
`strada-preview.d6e.us` and `ingest-preview.d6e.us`. The control plane uses D1;
ClickHouse runs in the `strada-clickhouse` namespace of the Minilab cluster.
Each project's OTLP endpoint is `https://ingest.d6e.us/{projectId}` (or the
preview ingest host). The ClickHouse URL configured in Strada points to the
`minilab-strada-clickhouse-proxy` Worker. That Worker uses a Cloudflare VPC
Service through the existing Minilab cloudflared tunnel to reach the private
ClickHouse Service. The proxy and cluster resources live in the infra repo.

The fork is necessary for local email/password login, closed enrollment, and
deployment-specific domains. Upstream currently assumes Google OAuth and its
own `strada.sh` domains. Rebase the fork on a reviewed upstream release before
upgrading. If local auth becomes unmaintainable, the upstream Google OAuth
configuration is the fallback; do not silently open public signup.

## Deploy

Use pnpm. Keep secrets in the `strada-minilab` 1Password Environment and
Cloudflare Worker secrets. Never add secrets to the repository or local env
files. The website needs separate `BETTER_AUTH_SECRET` and
`STRADA_BOOTSTRAP_TOKEN` values for preview and production.

1. Apply the D1 migrations to preview, then run `CLOUDFLARE_ENV=preview pnpm
   --dir website build`. Check that `website/dist/rsc/wrangler.json` names
   `minilab-strada-website-preview` and `strada-minilab-preview`. The Vite
   build generates a redirected Wrangler config; `wrangler deploy --env
   preview` alone does **not** select the preview Worker if the preceding build
   targeted production.
2. Run `pnpm --dir website exec wrangler deploy --env preview` and `pnpm --dir
   otel-collector deploy`. Verify the preview UI, closed signup, sign-in, and
   a preview ingest request before promoting production.
3. Apply the D1 migrations to production, run `pnpm --dir website build`,
   check the generated config names `minilab-strada-website` and
   `strada-minilab`, then run `pnpm --dir website exec wrangler deploy` and
   `pnpm --dir otel-collector deploy:prod`.

Owner enrollment is a one-time POST to `/api/auth/sign-up/email` with the
`x-strada-bootstrap-token` header. Only `STRADA_ADMIN_EMAIL` is accepted and
signup closes after the first user exists. Do not expose the bootstrap token to
the browser. Store the owner password in 1Password. The public login form only
signs in existing users.

Alert emails use `alerts@d6e.us`; webhook alerts are also supported. Verify
the Cloudflare Email Sending sender before relying on email alerts.
