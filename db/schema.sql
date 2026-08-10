-- Staff Check-in & Feedback Survey — schema
-- Safe to run more than once.
-- gen_random_uuid() is built into Postgres 13+, so no extension is needed.

-- Single-use email verification. Nothing here is readable without the app keys:
-- the address is AES-256-GCM encrypted, and the lookup columns are keyed hashes.
create table if not exists verification_tokens (
  id          uuid primary key default gen_random_uuid(),
  email_hash  text        not null,
  email_enc   text        not null,
  company     text        null check (company in ('portal', 'synergy')),
  purpose     text        not null check (purpose in ('survey', 'results')),
  token_hash  text        not null unique,
  code_hash   text        not null,
  expires_at  timestamptz not null,
  consumed_at timestamptz null,
  created_at  timestamptz not null default now()
);

create index if not exists verification_tokens_email_idx
  on verification_tokens (email_hash, purpose);
create index if not exists verification_tokens_created_idx
  on verification_tokens (created_at);

-- One row per respondent. Every answer lives inside payload_enc; only the
-- company (needed for filtering, and not sensitive on its own) is plaintext.
create table if not exists submissions (
  id           uuid primary key default gen_random_uuid(),
  email_hash   text        not null unique,
  email_enc    text        not null,
  company      text        not null check (company in ('portal', 'synergy')),
  payload_enc  text        not null,
  revision     integer     not null default 1,
  submitted_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists submissions_company_idx on submissions (company);
create index if not exists submissions_updated_idx on submissions (updated_at desc);
