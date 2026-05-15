-- Bug reports table. Anyone can submit (signed-in or not); only admins read.
-- Run in Supabase SQL Editor.

create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  reporter_email text,
  title text not null,
  description text not null,
  url text,            -- page the user was on when they hit the bug
  user_agent text,     -- browser / OS info from the request
  status text not null default 'new'
    check (status in ('new', 'investigating', 'fixed', 'wontfix', 'duplicate')),
  notes text,          -- admin scratchpad
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create index if not exists bug_reports_status_created_idx
  on public.bug_reports(status, created_at desc);

-- No public access; all reads/writes go through API routes that either
-- use the service role (submission) or check admin email (review).
alter table public.bug_reports enable row level security;
