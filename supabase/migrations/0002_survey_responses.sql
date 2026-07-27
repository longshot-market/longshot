-- Longshot onboarding questionnaire: one survey response row per user.
-- Captured on /welcome after the user links their Polymarket account. Answers
-- are for internal research only. Each question is independently skippable, so
-- every answer column is nullable — NULL means "skipped / not answered".
--
-- Security model mirrors 0001: the anon key is public, access is gated by RLS,
-- and "auto-expose new tables" is OFF so privileges are granted explicitly.
-- A user may only read/write their own row.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

-- Typed columns (one per question) rather than a JSONB blob, so responses are
-- straightforward to query for research. The choice columns store stable slugs
-- (not display labels), constrained to the known set. The *_other columns hold
-- the free-text answer when the user picks the "other" option; character
-- validation ("no weird characters") is enforced client-side, and the DB caps
-- length as a backstop.
create table if not exists public.survey_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,

  -- Q1: "What is your biggest frustration today?"
  frustration text
    check (frustration in (
      'performance', 'strategies', 'risk', 'markets', 'traders', 'manual_work', 'other'
    )),
  frustration_other text
    check (frustration_other is null or char_length(frustration_other) <= 120),

  -- Q2: "How did you hear about us?"
  referral_source text
    check (referral_source in (
      'ai_search', 'google', 'x', 'reddit', 'friend', 'community', 'other'
    )),
  referral_source_other text
    check (referral_source_other is null or char_length(referral_source_other) <= 120),

  -- Free text only makes sense alongside the matching "other" choice.
  constraint survey_frustration_other_requires_other
    check (frustration_other is null or frustration = 'other'),
  constraint survey_referral_other_requires_other
    check (referral_source_other is null or referral_source = 'other'),

  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.survey_responses enable row level security;

-- Read/write your own row only. The flow upserts (insert on first pass, update
-- if the user revisits), so both insert and update policies are needed.
drop policy if exists survey_responses_select_own on public.survey_responses;
create policy survey_responses_select_own on public.survey_responses
  for select using ((select auth.uid()) = user_id);

drop policy if exists survey_responses_insert_own on public.survey_responses;
create policy survey_responses_insert_own on public.survey_responses
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists survey_responses_update_own on public.survey_responses;
create policy survey_responses_update_own on public.survey_responses
  for update using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Grants (auto-expose is OFF, so grant explicitly; RLS still gates rows).
-- anon (logged out) gets nothing. No delete — responses are keep-only.
-- ---------------------------------------------------------------------------

grant select, insert, update on public.survey_responses to authenticated;
