create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  type text not null check (type in ('email', 'phone')),
  otp_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (identifier, type)
);

create index if not exists otp_codes_lookup_idx
  on public.otp_codes (identifier, type, consumed_at, expires_at);

alter table public.otp_codes enable row level security;

-- The server uses SUPABASE_SERVICE_ROLE_KEY for OTP writes/reads. Do not add
-- public anon policies; users should never read OTP hashes directly.
