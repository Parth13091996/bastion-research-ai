# Onboarding Drop-Off Timer (Role = `drop_off`)

This feature automatically marks users as `drop_off` if they start onboarding but do not complete it within a configurable delay.

## What counts as “completed onboarding”?

The scheduler will NOT flip role to `drop_off` when `users.status` is:

- `active`
- `free`

Any other status (for example `onboarded`, `agreement_signed`, `payment_pending`) may be marked `drop_off` after the delay.

## Configuration

The delay and check interval are configured in `apps/server/src/utils/config.ts` via environment variables:

- `ONBOARDING_DROP_OFF_DELAY_MS` (default: `3 * 60 * 60 * 1000`)
- `ONBOARDING_DROP_OFF_CHECK_INTERVAL_MS` (default: `15 * 60 * 1000`)

## Notes on roles

- The frontend no longer sets `users.role = drop_off` immediately when a paid plan is selected.
- Instead, it uses a temporary role (`employee`) and lets the backend scheduler flip to `drop_off` only after the delay.

