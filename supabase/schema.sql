create table flights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
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
