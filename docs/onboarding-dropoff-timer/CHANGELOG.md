# Changelog

## 2026-03-30

### Backend

- Removed server-start drop-off scheduler approach.
- Added event endpoint `POST /api/auth/onboarding-dropoff/start` to begin tracking from the signup flow.
- Added per-user delayed timer logic in `apps/server/src/automations/onboardingDropOff.scheduler.ts`.
- Timer is armed when onboarding creates the user record and a valid tracking session id is provided.
- At timeout, only that user is checked and marked `drop_off` if status is still incomplete.

### Frontend

- Updated onboarding plan selection (`apps/web/src/pages/Register/Steps/PlansStep.tsx`) so paid-plan users are not marked `drop_off` immediately.
- The temporary onboarding role is set to `employee` (unless the role is already `drop_off`).
- Signup form now sends onboarding start event on render and stores `onboardingSessionId`.
- `KYCStep` sends `onboarding_session_id` when calling `startOnboarding`.

### Zero-amount payment completion

- Updated `zeroAmountAccountCreation` (`apps/server/src/controllers/auth.controller.ts`) to correctly set the final subscriber role on successful activation based on `membership_plans.plan_code`:
  - `research_hub` -> `research_ally_subscriber`
  - `freemium` -> `free_subscriber`
  - otherwise -> `core_subscriber`
- Also clears any armed per-user drop-off timer after successful activation.

