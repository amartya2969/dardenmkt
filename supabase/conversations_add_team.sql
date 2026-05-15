-- Allow conversations to attach to either a listing OR a team post.
-- Run in Supabase SQL Editor.
--
-- Backward compatibility: existing rows already have listing_id set; the
-- CHECK constraint accepts (listing_id set, team_id null), which they all
-- already satisfy. No data migration needed.

-- 1) Make listing_id nullable
alter table public.conversations
  alter column listing_id drop not null;

-- 2) Add team_id (nullable FK to teams)
alter table public.conversations
  add column if not exists team_id uuid references public.teams(id) on delete cascade;

-- 3) Enforce exactly-one-target: a conversation is about a listing OR a team,
-- never both, never neither.
alter table public.conversations
  drop constraint if exists conversations_one_target_only;

alter table public.conversations
  add constraint conversations_one_target_only check (
    (listing_id is not null and team_id is null) or
    (listing_id is null and team_id is not null)
  );

-- 4) Index for team-based lookups (mirrors what likely exists for listing_id)
create index if not exists conversations_team_id_idx on public.conversations(team_id);

-- 5) Prevent duplicate conversations per (team, initiator) pair, same as the
-- implicit dedup for listings. Skip if you don't have a similar UNIQUE on
-- (listing_id, initiator_id).
create unique index if not exists conversations_team_initiator_uniq
  on public.conversations(team_id, initiator_id)
  where team_id is not null;
