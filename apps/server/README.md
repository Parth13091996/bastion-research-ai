# Bastion Research – Server

This server already exposes an endpoint to receive Digio webhooks and updates your records accordingly.

## What’s a webhook?
- A webhook is an HTTP POST that a provider sends to your API when something happens in their system. Instead of you polling Digio for updates, Digio calls your URL and posts a small JSON payload (for example, when a document is signed or rejected).

## Digio – Webhook endpoint
- URL: `POST /api/digio/webhook`
- Response: must return `200 OK` within 10 seconds. The handler acknowledges immediately and logs/updates status asynchronously.

### Events handled
Based on the Digio eSign product, the handler normalizes the following event types and updates status (mapping shown on the right):
- `doc.signed`: `signed`
- `doc.sign.rejected`: `rejected`
- `doc.sign.failed`: `failed`
- `esign.v3.sign.failed`: `failed`
- `esign.v3.sign.pending`: `pending`

Any other event is stored as-is in `raw_response` (if database table exists).

### Security (signature verification)
Digio Webhook Groups provide a Group Secret. The server can verify the webhook signature using HMAC-SHA256.

Env vars (see `.env.example`):
- `DIGIO_WEBHOOK_SECRET`: the Group Secret from Digio Dashboard → Profile → Webhooks → your Group.
- `DIGIO_WEBHOOK_REQUIRE_SIGNATURE` (default `false`): set to `true` to reject requests without a valid signature.

Notes:
- The server captures the raw body (`req.rawBody`) to verify signatures safely.
- It accepts common header variants like `x-digio-signature` or `x-webhook-signature` and (if provided) `x-webhook-timestamp`.

### Configure on Digio
1) Go to Digio Enterprise Dashboard → Profile → Webhooks.
2) Create or edit a Webhook Group.
3) Set the Group URL to your server’s public URL, e.g. `https://your.domain/api/digio/webhook`.
4) Copy the Group Secret and set it in `DIGIO_WEBHOOK_SECRET`.
5) Enable the eSign events you want (e.g. `doc.signed`, `doc.sign.rejected`, `doc.sign.failed`, `esign.v3.sign.failed`, `esign.v3.sign.pending`).

### Local testing
You can simulate a POST locally:

```bash
curl -X POST http://localhost:3001/api/digio/webhook \
  -H 'Content-Type: application/json' \
  -d '{"event":"doc.signed","document_id":"doc_123"}'
```

If `DIGIO_WEBHOOK_REQUIRE_SIGNATURE=true` you must include a valid HMAC signature. For quick testing leave it as `false`.

### Persistence
If the table `public.digio_documents` exists, the handler attempts to update the row where `document_id` matches, setting `status` and `raw_response`.

> Tip: If you also store `user_id → document_id` at creation time, the webhook will enrich your existing record automatically when the status changes.

## Analytics (Page Views)

The server provides a lightweight analytics system to track page views with IP- and user-level aggregation.

- Public endpoint (called by SPA on route changes): `POST /api/analytics/track`
  - Body: `{ path: string; title?: string; referrer?: string }`
  - Uses cookie `token` (if present) to attach `user_id`
  - Captures `ip` from `x-forwarded-for` / socket, and `user_agent`

- Admin summary endpoint: `GET /api/admin/analytics/summary?days=7`
  - Secured by admin auth
  - Returns: visits per day, unique users per day, top pages, and active users/IPs in the last 5 minutes

### Database schema

Create the table in your Supabase/Postgres project (run once):

File: `apps/server/sql/analytics.sql`

```sql
create extension if not exists pgcrypto;

create table if not exists public.analytics_pageviews (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  path text not null,
  title text,
  referrer text,
  ip text,
  user_id text,
  user_agent text
);

create index if not exists idx_analytics_pageviews_occurred_at on public.analytics_pageviews (occurred_at desc);
create index if not exists idx_analytics_pageviews_path on public.analytics_pageviews (path);
create index if not exists idx_analytics_pageviews_user_id on public.analytics_pageviews (user_id);
```

Env requirements:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be set (already used elsewhere in this server)

Notes:
- The track endpoint fails open (returns 202) if the table doesn’t exist yet; apply the SQL above to enable full analytics.
- If you deploy behind a proxy, ensure it forwards `x-forwarded-for` so IPs are accurate.
