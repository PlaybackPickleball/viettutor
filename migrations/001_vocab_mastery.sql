-- Per-user vocabulary mastery + XP ledger (stable vocabulary_id = pack word id e.g. v001)

create table if not exists vocab_word_mastery (
  user_id text not null,
  vocabulary_id text not null,
  introduced_at timestamptz,
  lesson_completed_at timestamptz,
  attempts integer not null default 0,
  correct_first_attempts integer not null default 0,
  typing_attempts integer not null default 0,
  typing_correct integer not null default 0,
  listening_attempts integer not null default 0,
  listening_correct integer not null default 0,
  recognition_attempts integer not null default 0,
  recognition_correct integer not null default 0,
  pronunciation_attempts integer not null default 0,
  pronunciation_correct integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at date,
  review_interval_days integer not null default 0,
  consecutive_successes integer not null default 0,
  mastery_status text not null default 'New',
  updated_at timestamptz not null default now(),
  primary key (user_id, vocabulary_id)
);

create index if not exists vocab_word_mastery_user_due_idx
  on vocab_word_mastery (user_id, next_review_at);

create table if not exists vocab_xp_ledger (
  user_id text not null,
  event_key text not null,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_key)
);

create table if not exists vocab_user_meta (
  user_id text primary key,
  completed_lesson_ids jsonb not null default '[]'::jsonb,
  total_xp integer not null default 0,
  updated_at timestamptz not null default now()
);
