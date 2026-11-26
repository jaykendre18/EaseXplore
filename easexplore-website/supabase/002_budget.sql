-- EaseXplore: expenses and daily budget (Step 7)
--
-- HOW TO RUN: in Supabase open "SQL Editor", click "New query", paste this whole file,
-- and click "Run". You should see "Success. No rows returned".
-- It is safe to run again: it will not duplicate anything or delete saved expenses.
-- (Run 001_itineraries.sql first if you have not already.)
--
-- Money is stored in PAISE (100 paise = Rs 1) as whole numbers.

-- 1. Expenses ------------------------------------------------------------------
create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  -- Filled in automatically with the logged-in person's id.
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  spent_on     date not null default current_date check (spent_on >= date '2020-01-01'),
  amount_paise integer not null check (amount_paise > 0 and amount_paise <= 100000000),
  category     text not null check (category in ('food', 'transport', 'entry', 'shopping', 'other')),
  note         text not null default '' check (char_length(note) <= 80),
  created_at   timestamptz not null default now()
);

create index if not exists expenses_user_date_idx
  on public.expenses (user_id, spent_on desc, created_at desc);

alter table public.expenses enable row level security;

drop policy if exists "Read own expenses" on public.expenses;
create policy "Read own expenses"
  on public.expenses for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Add own expenses" on public.expenses;
create policy "Add own expenses"
  on public.expenses for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Delete own expenses" on public.expenses;
create policy "Delete own expenses"
  on public.expenses for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Logged-out visitors get no access. Logged-in people may read, add and delete (not edit)
-- their own rows. New projects may not expose new tables automatically, so the
-- permission is granted explicitly.
revoke all on table public.expenses from anon;
grant select, insert, delete on table public.expenses to authenticated;

-- Limit: at most 5,000 saved expenses per person.
create or replace function public.limit_expenses_per_user()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.expenses where user_id = new.user_id) >= 5000 then
    raise exception 'Too many saved expenses' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists expenses_limit on public.expenses;
create trigger expenses_limit
  before insert on public.expenses
  for each row execute function public.limit_expenses_per_user();

-- 2. Daily budget (one row per person) ----------------------------------------
create table if not exists public.budget_settings (
  user_id            uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  -- Between Rs 50 and Rs 1,00,000 a day.
  daily_budget_paise integer not null check (daily_budget_paise between 5000 and 10000000),
  updated_at         timestamptz not null default now()
);

alter table public.budget_settings enable row level security;

drop policy if exists "Read own budget" on public.budget_settings;
create policy "Read own budget"
  on public.budget_settings for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Add own budget" on public.budget_settings;
create policy "Add own budget"
  on public.budget_settings for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Change own budget" on public.budget_settings;
create policy "Change own budget"
  on public.budget_settings for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on table public.budget_settings from anon;
grant select, insert, update on table public.budget_settings to authenticated;
