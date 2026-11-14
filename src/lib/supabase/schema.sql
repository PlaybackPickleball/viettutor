-- ÁMi Lingua — Supabase schema stub (not applied automatically)
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
  letter_id text,
  expected_text text,
  dimension text,
  tip text,
  passed boolean,
  simulated boolean not null default true,
  scoring_available boolean not null default false,
  duration_ms int,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  raw_ocr text not null,
  corrected_text text not null,
  image_path text,
  provider text,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_segments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.reading_lessons (id) on delete cascade,
  text text not null,
  kind text not null,
  expression text not null,
  start_idx int,
  end_idx int
);

create table if not exists public.saved_vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  expression text not null,
  meaning_en text not null,
  original_sentence text,
  source_lesson_id uuid references public.reading_lessons (id) on delete set null,
  practice_count int not null default 0,
  review_status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  kind text not null,
  ref_id text,
  payload jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.learner_progress enable row level security;
alter table public.pronunciation_attempts enable row level security;
alter table public.reading_lessons enable row level security;
alter table public.reading_segments enable row level security;
alter table public.saved_vocabulary enable row level security;
alter table public.learning_progress enable row level security;

-- ÁMi Sing tables (apply when Supabase is wired; client uses localStorage until then)

create table if not exists public.songs (
  id text primary key,
  title text not null,
  artist text not null,
  songwriter text,
  language text not null default 'vi',
  genre text,
  difficulty text,
  vocal_type text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.song_assets (
  id uuid primary key default gen_random_uuid(),
  song_id text not null references public.songs (id) on delete cascade,
  asset_type text not null,
  storage_path text,
  duration_ms int,
  dialect text,
  version text,
  status text not null default 'pending'
);

create table if not exists public.song_rights (
  id uuid primary key default gen_random_uuid(),
  song_id text not null references public.songs (id) on delete cascade,
  asset_id uuid references public.song_assets (id) on delete set null,
  rights_type text,
  rights_holder text,
  license_status text not null default 'pending',
  territory text default 'WW',
  allowed_uses text[] not null default '{}',
  effective_date date,
  expiration_date date,
  documentation_path text
);

create table if not exists public.lyric_segments (
  id uuid primary key default gen_random_uuid(),
  song_id text not null references public.songs (id) on delete cascade,
  start_ms int not null,
  end_ms int not null,
  text_vi text not null,
  text_en text,
  token_timing_json jsonb,
  display_order int not null default 0
);

create table if not exists public.user_song_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  song_id text not null references public.songs (id) on delete cascade,
  learning_mode text,
  completed_sections jsonb,
  last_position_ms int,
  updated_at timestamptz not null default now(),
  primary key (user_id, song_id)
);

create table if not exists public.singing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  song_id text not null references public.songs (id) on delete cascade,
  lyric_segment_id uuid references public.lyric_segments (id) on delete set null,
  recording_path text,
  created_at timestamptz not null default now(),
  consent_status text not null default 'temporary',
  feedback_json jsonb
);

alter table public.songs enable row level security;
alter table public.song_assets enable row level security;
alter table public.song_rights enable row level security;
alter table public.lyric_segments enable row level security;
alter table public.user_song_progress enable row level security;
alter table public.singing_attempts enable row level security;
