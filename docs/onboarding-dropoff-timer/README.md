# Onboarding Drop-Off Timer (Role = `drop_off`)

This feature automatically marks users as `drop_off` if they start onboarding but do not complete it within a configurable delay.

## Trigger model (event-driven, not server startup)

There is **no global drop-off scheduler started with the server**.

Flow:

1. Signup form render triggers `POST /api/auth/onboarding-dropoff/start`.
2. Server creates an onboarding tracking session id.
3. When user record is actually created in onboarding (`POST /api/auth/onboard`), server arms a **per-user timer** using that session id.
4. After delay, server checks that user only; if still incomplete, role is updated to `drop_off`.

## What counts as “incomplete onboarding”?

Drop-off assignment will NOT happen when `users.status` is:

- `active`
- `free`

Any other status (for example `onboarded`, `agreement_signed`, `payment_pending`) may be marked `drop_off` after the delay.

## Configuration

The delay is configured in `apps/server/src/utils/config.ts` via:

- `ONBOARDING_DROP_OFF_DELAY_MS` (default: `3 * 60 * 60 * 1000`)

## Notes on roles

- The frontend no longer sets `users.role = drop_off` immediately when a paid plan is selected.
- Instead, it uses a temporary role (`employee`) and lets the backend per-user timer flip to `drop_off` only after the delay.

