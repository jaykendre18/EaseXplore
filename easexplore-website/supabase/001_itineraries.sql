-- EaseXplore: saved itineraries (Step 6)
--
-- HOW TO RUN: in Supabase open "SQL Editor", click "New query", paste this whole file,
-- and click "Run". You should see "Success. No rows returned".
-- It is safe to run again: it will not duplicate anything or delete saved plans.

-- 1. The table ---------------------------------------------------------------
create table if not exists public.itineraries (
  id         uuid primary key default gen_random_uuid(),
  -- Filled in automatically with the logged-in person's id.
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  inputs     jsonb not null check (pg_column_size(inputs) < 4000),
  summary    jsonb not null default '{}'::jsonb check (pg_column_size(summary) < 2000),
  created_at timestamptz not null default now()
);

create index if not exists itineraries_user_created_idx
  on public.itineraries (user_id, created_at desc);

-- 2. Security: each person can only see and change their own plans -------------
alter table public.itineraries enable row level security;

drop policy if exists "Read own itineraries" on public.itineraries;
create policy "Read own itineraries"
  on public.itineraries for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Add own itineraries" on public.itineraries;
create policy "Add own itineraries"
  on public.itineraries for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own itineraries" on public.itineraries;
create policy "Delete own itineraries"
  on public.itineraries for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Logged-out visitors get no access at all. Logged-in users may read, add and delete
-- (not edit) their own rows. New projects may not expose new tables automatically,
-- so the permission is granted explicitly here.
revoke all on table public.itineraries from anon;
grant select, insert, delete on table public.itineraries to authenticated;

-- 3. Limit: at most 50 saved plans per person ----------------------------------
create or replace function public.limit_itineraries_per_user()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.itineraries where user_id = new.user_id) >= 50 then
    raise exception 'Too many saved plans' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists itineraries_limit on public.itineraries;
create trigger itineraries_limit
  before insert on public.itineraries
  for each row execute function public.limit_itineraries_per_user();
