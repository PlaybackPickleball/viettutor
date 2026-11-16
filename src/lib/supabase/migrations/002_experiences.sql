-- Additive experience split. Apply manually in the Supabase SQL editor.
-- Existing learner rows stay on en_to_vi via the column default.
-- No statement here removes rows or columns.
-- The app still stores progress in localStorage until Supabase auth is wired.
-- There is no subscription table in this project; nothing here resets a plan.

alter table public.learner_progress
  add column if not exists experience_id text not null default 'en_to_vi';

alter table public.pronunciation_attempts
  add column if not exists experience_id text not null default 'en_to_vi';

alter table public.saved_vocabulary
  add column if not exists experience_id text not null default 'en_to_vi';

alter table public.learning_progress
  add column if not exists experience_id text not null default 'en_to_vi';

alter table public.user_song_progress
  add column if not exists experience_id text not null default 'en_to_vi';

create unique index if not exists learner_progress_experience_uidx
  on public.learner_progress (user_id, experience_id, letter_id);

create table if not exists public.course_enrollment (
  user_id uuid not null references public.profiles (id) on delete cascade,
  experience_id text not null check (experience_id in ('en_to_vi', 'vi_to_en')),
  ui_language text not null,
  text_size text not null default 'standard',
  onboarding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, experience_id)
);

create table if not exists public.english_lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null,
  stage_index int not null default 0,
  cleared jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.english_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  lesson_id text not null,
  phrase text not null,
  source text not null,
  category text,
  failed boolean not null default true,
  phoneme_scoring boolean not null default false,
  observation text not null,
  recognized_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.english_review_items (
  id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null,
  phrase_en text not null,
  phrase_vi text not null,
  due_on date not null,
  interval_days int not null default 1,
  lapses int not null default 0,
  primary key (user_id, id)
);

alter table public.course_enrollment enable row level security;
alter table public.english_lesson_progress enable row level security;
alter table public.english_attempts enable row level security;
alter table public.english_review_items enable row level security;
