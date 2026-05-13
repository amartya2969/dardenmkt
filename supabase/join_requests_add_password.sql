-- Add a transient password column to join_requests.
-- Stored only between user submission and admin approval; nulled the moment
-- the auth user is created. Plain-text is required because Supabase needs
-- the real password to hash on createUser — hashing here breaks login.
--
-- Safety relies on:
--   - RLS already enabled (no public access)
--   - Service-role key kept server-side
--   - Approval nulls the column inside the same request that creates the user
--
-- Run this in the Supabase SQL Editor.

alter table public.join_requests
  add column if not exists pending_password text;
