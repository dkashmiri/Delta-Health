-- One row per user: age gate and consent record. Health questionnaire data arrives in M2.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  date_of_birth date,
  consent_version text,
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_dob_min check (date_of_birth >= date '1900-01-01'),
  constraint profiles_consent_version_format check (consent_version ~ '^\d{4}-\d{2}-\d{2}$')
);

alter table public.profiles enable row level security;

-- Only what the app needs: no anon access, no delete, no truncate (which bypasses RLS).
revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

create policy profiles_insert_own on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- No delete policy: account deletion (M6) goes through a server function and cascades from auth.users.

-- Enforces the 18+ gate on the server and owns consent_at so clients cannot set or backdate it.
create function public.profiles_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.date_of_birth is not null
     -- Sydney's calendar date, matching the app, so nobody is rejected on their 18th birthday.
     and new.date_of_birth > ((now() at time zone 'Australia/Sydney')::date - interval '18 years')::date then
    raise exception 'Delta Health is for adults 18 and over' using errcode = 'check_violation';
  end if;

  if tg_op = 'INSERT' then
    new.consent_at := case when new.consent_version is null then null else now() end;
    new.created_at := now();
  elsif new.consent_version is distinct from old.consent_version then
    new.consent_at := case when new.consent_version is null then null else now() end;
  else
    new.consent_at := old.consent_at;
  end if;

  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_guard
  before insert or update on public.profiles
  for each row execute function public.profiles_guard();
