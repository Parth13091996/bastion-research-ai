-- Content tables for newsletters, webinars, podcasts
-- Run this SQL in your Supabase/Postgres project

create extension if not exists pgcrypto;

-- Newsletters
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sub_title text,
  headline_image_url text,
  html_content text,
  footer_content text,
  created_at timestamptz not null default now()
);

create index if not exists idx_newsletters_created_at on public.newsletters (created_at desc);

-- Webinars
create table if not exists public.webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_webinars_created_at on public.webinars (created_at desc);

-- Podcasts
create table if not exists public.podcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  html_content text,
  video_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_podcasts_created_at on public.podcasts (created_at desc);

