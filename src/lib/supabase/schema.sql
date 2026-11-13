-- ÁMi Lingua Level 1 — Supabase schema stub (not applied automatically)
-- Run in Supabase SQL editor when ready. App persists to localStorage until then.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  dialect text not null default 'southern' check (dialect in ('southern', 'northern')),
  created_at timestamptz not null default now()
);

create table if not exists public.learner_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  letter_id text not null,
  heard boolean not null default false,
  say_streak int not null default 0,
  say_mastered boolean not null default false,
  written boolean not null default false,
  object_seen boolean not null default false,
  attempts int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, letter_id)
);

create table if not exists public.pronunciation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  letter_id text not null,
  dimension text not null,
  tip text not null,
  passed boolean not null,
  simulated boolean not null default true,
  duration_ms int,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.learner_progress enable row level security;
alter table public.pronunciation_attempts enable row level security;

-- Policies to add once auth is enabled:
-- create policy "own profile" on profiles for all using (auth.uid() = id);
-- create policy "own progress" on learner_progress for all using (auth.uid() = user_id);
