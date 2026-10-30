# CORE premium access and one-time introductory purchases

## Entitlement

The server reads the current user and assigned membership plan on every protected request.

- Active Admin and Employee accounts have premium access regardless of plan or dates.
- Active Core Subscribers qualify only with plan 2 (`core`, 3 months) or plan 3 (`core_annual`, 12 months), a valid start date at or before today, and a valid expiry on or after today.
- Dates use Asia/Kolkata calendar days. The expiry day is included. Missing, malformed and future-start dates fail closed.
- Other roles/plans get only explicitly freemium recommendations. Aggregate dashboard metrics and public webinars remain available.
- Staff retain their existing administration/edit permissions; premium access does not grant edit permissions to subscribers.

The UI reads `/api/cashfree/subscription` rather than inferring access from the role or payment attempts. It rechecks every minute and on focus/reconnect. APIs are authoritative on each request. Recommendations, sheet data, direct research pages/resources, scratchpad, premium webinars and premium benefits enforce the same entitlement.

## Three-month purchase history

Only plan 2 is limited to one consumed purchase per account. SUCCESS, COMPLETED, PAID, COUPON_APPLIED and FREE records count, including legacy purchases. Changing role, current plan or expiry does not reset eligibility. Successful intro records cannot be deleted through the payment-history endpoint.

A deterministic UUID reserves the intro checkout through `payment_history.transaction_id`. Before activation, verify this column has a unique or primary-key constraint in the production schema. Production read-only metadata verification on 30 October 2026 confirmed that `transaction_id` is a UUID primary key and both subscription date columns are PostgreSQL dates. Concurrent attempts cannot create independent reservations. An existing active Cashfree order is reused; a new attempt is allowed only after provider-confirmed expiry/cancellation. Uncertain provider responses fail closed. Annual purchases do not use this reservation or the once-only check and remain renewable repeatedly.

Order creation and zero-amount activation require the authenticated account. Amounts and coupon validity are recomputed on the server; client `is_free`/amount fields never grant access. Webhooks fetch the provider order, validate its customer, plan, transaction, amount and currency, and ignore completed replays. Staff roles are preserved. Annual renewal extends from a still-valid paid expiry; an expired plan starts from the new payment date. Failed payments do not suspend an existing active plan.

## Deployment order

1. Back up live backend sources/dist and website entry page. Compare production auth code with repository sources; preserve production cookie/Bearer compatibility and unrelated fixes.
2. Run backend tests/typecheck and frontend build/browser checks. Existing unrelated frontend type errors are tracked separately.
3. Production metadata verification on 30 October 2026 confirmed the transaction UUID primary key. Set `CORE_INTRO_RESERVATIONS_VERIFIED=true` only after confirming the constraint. Without this flag, introductory checkout fails closed with 503, while annual purchases remain available. Do not activate the concurrency protection without that verification. Then run `node dist/scripts/secure-premium-documents.js` on the backend host as a read-only storage inventory. It uses that host's existing Supabase service credentials. Never copy keys into client code or a public directory.
4. Review the inventory. With publication approval, run the same script with `--apply --retire-public` to copy referenced PDFs into the private `premium-research` bucket, verify SHA-256 copies, update resource references, and retire unreferenced public originals. A mode-0600 manifest and private copies preserve rollback material. Any lookup/copy/update error stops retirement. Public/shared references are retained. Do not make the entire existing files bucket private: it also contains logos and public assets.
5. Deploy backend before frontend. Old frontend clients then cannot bypass the new APIs. Deploy frontend without replacing unrelated production modules/styles. No supplemental global stylesheet is required for this change.
6. Verify live role/plan matrix, direct APIs/documents, expired/future/missing dates, staff on freemium, free recommendations, pending/consumed intro purchase, and annual renewal. Use synthetic accounts and sandbox/provider mocks; do not charge clients as a test.
7. Verify old migrated PDF URLs no longer return documents and private bucket public URLs deny reads. Review Storage/Data API RLS before declaring direct Supabase access secure. The connected account currently cannot administer project `ftuuyfhfrhvlllfwfbjx`; use the owning account or the authorized backend service for storage verification.

## External and historical links

YouTube/Loom videos, published Google Sheets, WhatsApp invitations and previously shipped coupon codes remain governed by their source platform. The app no longer exposes premium links/benefits to unauthorized users, but cannot revoke a copied external public link. Rotate old invitations/codes or change hosting permissions where source-level privacy is required. A copied/downloaded document cannot be recalled from its recipient.

No storage objects, client accounts, payments or production access settings are changed by tests or a migration dry run. Publish requires the reviewed backend/frontend rollout and storage inventory, not just merging source code.

## Verified production state — 30 October 2026

Read-only backend metadata checks confirmed the transaction primary key and date column types. Storage currently has public `files` and `system_docs` buckets; `premium-research` does not exist yet. No application, database, bucket or document settings were changed. The temporary SSH key used for this check was removed; the original three keys remain, and authentication with the temporary key was verified to fail. Private document migration and publication remain pending.
