-- EaseXplore: favourite places (Step 8)
--
-- HOW TO RUN: in Supabase open "SQL Editor", click "New query", paste this whole file,
-- and click "Run". You should see "Success. No rows returned".
-- It is safe to run again: it will not duplicate anything or delete saved favourites.

-- 1. The table ---------------------------------------------------------------
create table if not exists public.favourites (
  -- Filled in automatically with the logged-in person's id.
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The place id from src/data/places.js, for example 'cafe-goodluck'.
  place_id   text not null check (place_id ~ '^[a-z0-9-]{1,60}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- 2. Security: each person can only see and change their own favourites --------
alter table public.favourites enable row level security;

drop policy if exists "Read own favourites" on public.favourites;
create policy "Read own favourites"
  on public.favourites for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Add own favourites" on public.favourites;
create policy "Add own favourites"
  on public.favourites for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own favourites" on public.favourites;
create policy "Delete own favourites"
  on public.favourites for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.favourites from anon;
grant select, insert, delete on table public.favourites to authenticated;

-- 3. Limit: at most 200 favourites per person ----------------------------------
create or replace function public.limit_favourites_per_user()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.favourites where user_id = new.user_id) >= 200 then
    raise exception 'Too many favourites' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists favourites_limit on public.favourites;
create trigger favourites_limit
  before insert on public.favourites
  for each row execute function public.limit_favourites_per_user();
