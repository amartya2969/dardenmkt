-- Short-term workaround for UVA ITS blocking inbound auth mail.
-- Users submit a join request; admins approve manually.
-- Run this in the Supabase SQL Editor.

create table if not exists public.join_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

-- Index for "show pending first" admin view
create index if not exists join_requests_status_created_idx
  on public.join_requests(status, created_at desc);

-- No public read/write — every interaction goes through API routes that
-- use the service-role key (request submission) or check admin email
-- against ADMIN_EMAILS env var.
alter table public.join_requests enable row level security;
