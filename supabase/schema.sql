create table if not exists flights (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  duration int not null,
  start_time timestamptz,
  end_time timestamptz,
  status text check (status in ('planned','active','completed','aborted')) default 'planned'
);

create table if not exists blocked_sites (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references flights on delete cascade,
  domain text not null
);

create table if not exists sessions_log (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references flights on delete cascade,
  actual_duration int,
  distractions_blocked_count int default 0
);

create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  last_blocked_sites text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists user_profiles
  add column if not exists display_name text;

alter table if exists user_profiles
  add column if not exists last_blocked_sites text[] not null default '{}';

alter table if exists user_profiles
  add column if not exists created_at timestamptz not null default now();

alter table if exists user_profiles
  add column if not exists updated_at timestamptz not null default now();

create or replace function increment_distractions(flight_id uuid)
returns void language sql security definer as $$
  update sessions_log
  set distractions_blocked_count = distractions_blocked_count + 1
  where sessions_log.flight_id = increment_distractions.flight_id;
$$;
