alter table flights enable row level security;
alter table blocked_sites enable row level security;
alter table sessions_log enable row level security;

create policy flights_select on flights
for select
using (auth.uid() = user_id);

create policy flights_insert on flights
for insert
with check (auth.uid() = user_id);

create policy flights_update on flights
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy flights_delete on flights
for delete
using (auth.uid() = user_id);

create policy blocked_sites_select on blocked_sites
for select
using (
  exists (
    select 1
    from flights
    where flights.id = blocked_sites.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy blocked_sites_insert on blocked_sites
for insert
with check (
  exists (
    select 1
    from flights
    where flights.id = blocked_sites.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy blocked_sites_update on blocked_sites
for update
using (
  exists (
    select 1
    from flights
    where flights.id = blocked_sites.flight_id
      and flights.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from flights
    where flights.id = blocked_sites.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy blocked_sites_delete on blocked_sites
for delete
using (
  exists (
    select 1
    from flights
    where flights.id = blocked_sites.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy sessions_log_select on sessions_log
for select
using (
  exists (
    select 1
    from flights
    where flights.id = sessions_log.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy sessions_log_insert on sessions_log
for insert
with check (
  exists (
    select 1
    from flights
    where flights.id = sessions_log.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy sessions_log_update on sessions_log
for update
using (
  exists (
    select 1
    from flights
    where flights.id = sessions_log.flight_id
      and flights.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from flights
    where flights.id = sessions_log.flight_id
      and flights.user_id = auth.uid()
  )
);

create policy sessions_log_delete on sessions_log
for delete
using (
  exists (
    select 1
    from flights
    where flights.id = sessions_log.flight_id
      and flights.user_id = auth.uid()
  )
);
