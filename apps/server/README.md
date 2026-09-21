# Bastion Research – Server

This service powers onboarding for the TripleEdge web application. The most relevant pieces for onboarding are:

- **Cashfree Payment Gateway** for plan checkout.
- **Cashfree Verification Suite** for PAN verification during KYC.
- **Supabase Storage helpers** for saving user assets such as signed agreements.

## KYC – Cashfree PAN Verification

The server exposes two lightweight proxies around Cashfree's verification APIs. These endpoints require the Verification Suite credentials (`CASHFREE_VERIFICATION_CLIENT_ID` / `CASHFREE_VERIFICATION_CLIENT_SECRET`). In non-production environments they default to the payment keys for convenience.

| Route | Method | Description |
| --- | --- | --- |
| `/api/cashfree/verification/pan` | POST | Verify a PAN against Cashfree. Body `{ pan, name }`. |
| `/api/cashfree/verification/pan/:referenceId` | GET | Fetch the status of a previous verification using Cashfree's reference id. |

Both handlers normalise the response to a common shape:

```json
{
  "referenceId": "12345",
  "valid": true,
  "status": "VALID",
  "registeredName": "JOHN DOE",
  "nameMatchScore": "100.00",
  "message": "PAN verified successfully"
}
```

### Environment

```
CASHFREE_ENV=sandbox|production
CASHFREE_VERIFICATION_CLIENT_ID=
CASHFREE_VERIFICATION_CLIENT_SECRET=
CASHFREE_VERIFICATION_API_VERSION=2022-09-12
```

## Agreement Signatures

The `/api/files/signatures` endpoint accepts a base64 encoded data URL (PNG/JPEG/WebP) and uploads it to Supabase Storage. It returns a public URL and the stored path so that the caller can persist metadata alongside the user record.

```
POST /api/files/signatures
{
  "dataUrl": "data:image/png;base64,..."
}
```

Supabase bucket defaults to `public`; override with `SUPABASE_STORAGE_BUCKET` if required.

## Cashfree Payments

`POST /api/cashfree/orders` creates a Cashfree PG order. The request now accepts an optional `metadata` object which is stored as `order_tags` on the Cashfree order. PAN verification details from onboarding/subscription flows are passed through this field.

---

For additional details check the source under `apps/server/src/controllers`.

## Production Operations

SSH into the server, attach the latest tmux session, and (re)start the upstream process using the script in the project root:

```
ssh root@82.29.166.56
tmux at
./upstream-server.sh
```

Run these from the server's project root directory. The script handles starting or restarting the upstream server.