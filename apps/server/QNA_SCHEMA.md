# QnA Supabase Schema

Run this SQL in Supabase before using the QnA endpoints:

```sql
create table if not exists public.qna_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(trim(question)) between 1 and 1000),
  answer text check (answer is null or char_length(trim(answer)) between 1 and 5000),
  author_name text not null default 'User',
  user_id uuid references public.users(id) on delete set null,
  answered_by uuid references public.users(id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qna_questions_created_at_idx
  on public.qna_questions (created_at desc);

create index if not exists qna_questions_answered_at_idx
  on public.qna_questions (answered_at desc);
```
