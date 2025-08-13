# Release Notes

## [Unreleased]

### Added
- Created `RELEASE.md` to track updates and changes.
- Implemented a custom sign-in flow with a "Sign in with Google" button.
- Created a backend for OTP verification using Supabase Functions (`send-otp` and `verify-otp`).
- Added a database migration for an `otp_verifications` table.

### Changed
- The login page now directly initiates the Google OAuth flow instead of showing a form.
- The sign-up form now calls the backend to send and verify OTPs.

### Fixed
- The issue where clicking the sign-in button would redirect to a Clerk-hosted UI.
