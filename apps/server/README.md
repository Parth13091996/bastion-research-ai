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
