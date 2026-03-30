# Changelog

## 2026-03-30

### Backend

- Added `startOnboardingDropOffJob()` (new scheduler) that periodically updates eligible users to `users.role = 'drop_off'`.
- The job marks users whose:
  - `created_at` is older than `ONBOARDING_DROP_OFF_DELAY_MS`
  - `users.status` is not `active` and not `free`
  - `users.role` is not already `drop_off`
  - `users.role` is not `admin`

### Frontend

- Updated onboarding plan selection (`apps/web/src/pages/Register/Steps/PlansStep.tsx`) so paid-plan users are not marked `drop_off` immediately.
- The temporary onboarding role is set to `employee` (unless the role is already `drop_off`).

### Zero-amount payment completion

- Updated `zeroAmountAccountCreation` (`apps/server/src/controllers/auth.controller.ts`) to correctly set the final subscriber role on successful activation based on `membership_plans.plan_code`:
  - `research_hub` -> `research_ally_subscriber`
  - `freemium` -> `free_subscriber`
  - otherwise -> `core_subscriber`

