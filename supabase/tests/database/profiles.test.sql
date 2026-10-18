-- RLS and trigger tests for public.profiles. Run with: supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(9);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local');

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ insert into public.profiles (id, consent_version, consent_at, created_at)
     values ('11111111-1111-1111-1111-111111111111', '2026-10-19', '2000-01-01', '2000-01-01') $$,
  'a user can create their own profile');

select ok(
  (select consent_at > '2020-01-01' from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'consent_at is set by the server, not the client');

select ok(
  (select created_at > '2020-01-01' from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'created_at is set by the server, not the client');

select throws_ok(
  $$ insert into public.profiles (id) values ('22222222-2222-2222-2222-222222222222') $$,
  '42501', null,
  'a user cannot create a profile for someone else');

select throws_ok(
  $$ update public.profiles set date_of_birth = current_date - interval '10 years'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  '23514', null,
  'an under-18 date of birth is rejected');

select lives_ok(
  $$ update public.profiles set date_of_birth = '1990-01-01'
     where id = '11111111-1111-1111-1111-111111111111' $$,
  'an adult date of birth is accepted');

select throws_ok(
  $$ delete from public.profiles where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'profiles cannot be deleted from the client');

-- Act as user B.
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

select is(
  (select count(*) from public.profiles), 0::bigint,
  'a user cannot see another user''s profile');

select is_empty(
  $$ update public.profiles set date_of_birth = '1980-01-01'
     where id = '11111111-1111-1111-1111-111111111111' returning id $$,
  'a user cannot update another user''s profile');

select * from finish();
rollback;
