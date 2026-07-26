-- Longshot auth schema: user profiles + linked Polymarket accounts.
-- Safe to commit (contains no secrets). Apply via Supabase SQL Editor or CLI.
--
-- Security model: the anon key is public, so access is gated by RLS. The
-- project has "auto-expose new tables" OFF, so table privileges are granted
-- explicitly below; RLS then filters rows. subscription_type is never writable
-- by clients — only the service role (server) can change it.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One profile row per auth user, created automatically on signup (trigger).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  subscription_type text not null default 'free'
    check (subscription_type in ('free', 'paid')),
  created_at timestamptz not null default now()
);

-- A user's linked Polymarket account(s). Modeled one-to-many for the future,
-- but a partial unique index keeps it to a single primary account for now.
create table if not exists public.linked_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  input text not null,          -- what the user typed (username or 0x address)
  wallet text,                  -- resolved 0x wallet address
  username text,                -- resolved display name (if any)
  is_primary boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists linked_accounts_user_id_idx
  on public.linked_accounts (user_id);

-- At most one primary account per user (effectively one account each, for now).
create unique index if not exists linked_accounts_one_primary
  on public.linked_accounts (user_id)
  where is_primary;

-- ---------------------------------------------------------------------------
-- Auto-create a profile for every new auth user
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.linked_accounts enable row level security;

-- profiles: read your own row only. No client writes at all — the profile is
-- created by the trigger, and subscription_type changes go through the service
-- role (which bypasses RLS and column grants).
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using ((select auth.uid()) = id);

-- linked_accounts: full CRUD on your own rows.
drop policy if exists linked_accounts_select_own on public.linked_accounts;
create policy linked_accounts_select_own on public.linked_accounts
  for select using ((select auth.uid()) = user_id);

drop policy if exists linked_accounts_insert_own on public.linked_accounts;
create policy linked_accounts_insert_own on public.linked_accounts
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists linked_accounts_update_own on public.linked_accounts;
create policy linked_accounts_update_own on public.linked_accounts
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists linked_accounts_delete_own on public.linked_accounts;
create policy linked_accounts_delete_own on public.linked_accounts
  for delete using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Grants (auto-expose is OFF, so grant explicitly; RLS still gates rows).
-- anon (logged out) gets nothing on these tables.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.linked_accounts to authenticated;
