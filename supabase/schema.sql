create table flights (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  duration int not null,
  start_time timestamptz,
  end_time timestamptz,
  status text check (status in ('planned','active','completed','aborted')) default 'planned'
);

create table blocked_sites (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references flights on delete cascade,
  domain text not null
);

create table sessions_log (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid references flights on delete cascade,
  actual_duration int,
  distractions_blocked_count int default 0
);

create or replace function increment_distractions(flight_id uuid)
returns void language sql security definer as $$
  update sessions_log
  set distractions_blocked_count = distractions_blocked_count + 1
  where sessions_log.flight_id = increment_distractions.flight_id;
$$;
