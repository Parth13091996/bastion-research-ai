# Public members API

The public members API gives an external CRM read-only access to member and
subscription data. Despite being internet-accessible, it is not anonymous:
every request must include the shared API key configured in
`PUBLIC_MEMBERS_API_KEY`.

## Authentication

Send the key in either of these headers:

```http
X-API-Key: your-secret-key
```

```http
Authorization: Bearer your-secret-key
```

Use a long, randomly generated production secret, transmit it only over HTTPS,
store it in the CRM's secret manager, and rotate it if it is exposed. The
server returns `503` when no key is configured and `401` for a missing or
incorrect key.

## List members

```http
GET /api/public/v1/members?page=1&page_size=100
```

The response contains CRM-relevant identity, contact, account status, role,
plan, and subscription dates. Passwords, PAN numbers, birth dates, and postal
addresses are intentionally excluded.

Optional query parameters:

| Parameter       | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `page`          | Positive page number; defaults to `1`.                      |
| `page_size`     | Results per page; defaults to `100`, maximum `500`.         |
| `status`        | Exact account-status filter, such as `active`.              |
| `role`          | Exact role filter, such as `core_subscriber` or `drop_off`. |
| `updated_since` | ISO date/time; returns records updated on or after it.      |

Example response:

```json
{
  "data": [
    {
      "id": "member-id",
      "username": "client",
      "email": "client@example.com",
      "first_name": "Example",
      "last_name": "Client",
      "phone": "+910000000000",
      "company": "Example Ltd",
      "role": "core_subscriber",
      "status": "active",
      "plan_id": 1,
      "subscription_start_date": "2026-01-01",
      "subscription_end_date": "2026-12-31",
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-02T00:00:00Z",
      "membership_plans": { "plan_code": "CORE", "plan_id": 1 }
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 100,
    "total": 1,
    "total_pages": 1
  }
}
```

Results are ordered by `updated_at` and then `id`, which supports repeatable CRM
imports. Use `updated_since` for incremental syncs and keep paging until the
last page. The endpoint sends `Cache-Control: private, no-store`.

Only `GET` (and standard `HEAD`) is supported. `POST`, `PUT`, `PATCH`, and
`DELETE` requests return `405 Method Not Allowed`; the integration cannot edit
member records through this API.
