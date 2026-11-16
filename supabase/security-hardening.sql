-- Peace and Afrova: security hardening, Phase 1.
-- Run in the Supabase SQL editor. Order: Section 0 and 1 BEFORE deploying the code, Section 2 AFTER the deploy works.
-- Table and column names are inferred from the code; adjust anything that does not match your schema.

-- ===== Section 0: admin identity ==========================================================
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;           -- no policies: nobody reads it from the browser
insert into public.admin_emails (email) values ('REPLACE-WITH-YOUR-ADMIN-EMAIL') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_emails
                 where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;
grant execute on function public.is_admin() to authenticated;

-- ===== Section 1: new columns the code relies on (safe, additive) ==========================
alter table public.supplier_bookings add column if not exists access_token uuid not null default gen_random_uuid();
create unique index if not exists supplier_bookings_access_token_key on public.supplier_bookings (access_token);
alter table public.supplier_bookings add column if not exists late_credit_applied boolean not null default false;
alter table public.supplier_bookings add column if not exists voucher_scanned_at timestamptz;

alter table public.bookings   add column if not exists balance_reminder_sent_at timestamptz;
alter table public.quotations add column if not exists sent_at timestamptz;
alter table public.quotations add column if not exists recovery_email_sent_at timestamptz;

-- Stops double-clicks and retries creating two bookings for one quote (check for existing duplicates first).
create unique index if not exists bookings_quotation_id_key on public.bookings (quotation_id);
create unique index if not exists quotations_booking_ref_key on public.quotations (booking_ref);

-- Quotes the client already received before this change would never get a recovery email; backfill if you want them to:
-- update public.quotations set quote_status = 'Sent', sent_at = created_at where quote_status = 'Draft' and booking_ref like 'PA-%';

-- ===== Section 2: lock tables that only the server or the admin should touch ===============
-- (Run after the new code is live. Server routes use the service role, which bypasses RLS.)
alter table public.applications          enable row level security;
alter table public.payments              enable row level security;
alter table public.partner_applications  enable row level security;

drop policy if exists admin_all on public.partner_applications;
create policy admin_all on public.partner_applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- applications and payments: no policy on purpose (server only).

-- Public read-only content
alter table public.faqs enable row level security;
alter table public.marquee_activities enable row level security;
drop policy if exists public_read on public.faqs;
drop policy if exists public_read on public.marquee_activities;
create policy public_read on public.faqs for select to anon, authenticated using (true);
create policy public_read on public.marquee_activities for select to anon, authenticated using (true);

-- ===== Section 3: lock the core tables (run only after Phase 2 code is deployed and tested) ===========
-- By then the client portal, driver job page and admin routes use server routes or an admin session, so these tables
-- need no anonymous access at all. If a page breaks after this, the cause is a leftover direct browser query.
do $$
declare t text;
begin
  foreach t in array array[
    'customers','enquiries','quotations','quotation_items','bookings','supplier_bookings',
    'concierge_requests','partners','partner_quotations','service_requests','reviews','services'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Public website content
drop policy if exists public_read on public.services;
create policy public_read on public.services for select to anon, authenticated using (true);
drop policy if exists public_read on public.reviews;
create policy public_read on public.reviews for select to anon, authenticated using (is_approved = true);

-- Partner portal (partners sign in with Supabase Auth; matched by email, as the pages already do).
-- VERIFY the column names marked (?) against your schema before running; a wrong name makes the statement fail loudly.
drop policy if exists partner_self on public.partners;
create policy partner_self on public.partners for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists partner_own_jobs on public.supplier_bookings;
create policy partner_own_jobs on public.supplier_bookings for select to authenticated
  using (partner_id in (select id from public.partners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))));

drop policy if exists partner_own_requests on public.service_requests;
create policy partner_own_requests on public.service_requests for select to authenticated
  using (partner_id in (select id from public.partners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))));

drop policy if exists partner_own_quotes on public.partner_quotations;
create policy partner_own_quotes on public.partner_quotations for select to authenticated
  using (service_request_id in (select id from public.service_requests
         where partner_id in (select id from public.partners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))));

-- The partner bookings page also shows the quote reference, travel date and client name for its own jobs.
drop policy if exists partner_job_quotations on public.quotations;
create policy partner_job_quotations on public.quotations for select to authenticated
  using (id in (select quotation_id from public.supplier_bookings
                where partner_id in (select id from public.partners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))));
drop policy if exists partner_job_enquiries on public.enquiries;
create policy partner_job_enquiries on public.enquiries for select to authenticated
  using (id in (select enquiry_id from public.quotations where id in (select quotation_id from public.supplier_bookings
                where partner_id in (select id from public.partners where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))))));  -- (?) quotations.enquiry_id
drop policy if exists partner_job_customers on public.customers;
create policy partner_job_customers on public.customers for select to authenticated
  using (id in (select customer_id from public.enquiries));  -- (?) tighten to the partner's own jobs if you prefer

-- Supabase dashboard, Authentication > Providers > Email: turn ON "Confirm email". The portal now refuses to link a login
-- to a booking record until the address is verified.

-- ===== Section 4: Phase 3 (rate limiting, flight watch). RUN THIS BEFORE deploying the Phase 3 code ======
create table if not exists public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limits enable row level security;   -- no policies: only the server (service role) touches it

create or replace function public.rate_limit_hit(p_key text, p_window_seconds int, p_max int, p_increment boolean default true)
returns boolean language plpgsql security definer set search_path = public as $$
declare w timestamptz; n int;
begin
  w := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  if p_increment then
    insert into public.rate_limits (key, window_start, hits) values (p_key, w, 1)
    on conflict (key, window_start) do update set hits = public.rate_limits.hits + 1
    returning hits into n;
  else
    select hits into n from public.rate_limits where key = p_key and window_start = w;
    n := coalesce(n, 0);
  end if;
  if random() < 0.01 then delete from public.rate_limits where window_start < now() - interval '2 days'; end if;
  return n <= p_max;
end $$;
revoke all on function public.rate_limit_hit(text, int, int, boolean) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, int, int, boolean) to service_role;

-- Flight watch
alter table public.enquiries add column if not exists scheduled_arrival_at timestamptz;  -- original schedule, the baseline for delays
alter table public.enquiries add column if not exists flight_checked_at timestamptz;
-- The engine writes ISO timestamps to these two. Check their type: select data_type from information_schema.columns
--   where table_name = 'enquiries' and column_name in ('estimated_arrival', 'actual_arrival');   (should be timestamp with time zone)
alter table public.supplier_bookings add column if not exists driver_minutes_late int not null default 0; -- the DRIVER's lateness; delay_minutes stays the flight delay

create table if not exists public.flight_events (
  id bigint generated always as identity primary key,
  quotation_id uuid references public.quotations (id) on delete cascade,  -- change the type if quotations.id is not a uuid
  flight_number text,
  flight_status text,
  scheduled_at timestamptz,
  estimated_at timestamptz,
  delay_minutes int,
  action text,
  note text,
  created_at timestamptz not null default now()
);
alter table public.flight_events enable row level security;
drop policy if exists admin_all on public.flight_events;
create policy admin_all on public.flight_events for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ===== Section 5: partner requests, quotations and one-click accept ======================================
-- Run before deploying the accept-quote code. It first CHECKS that the columns the code relies on exist and stops with a
-- readable message if not (paste that message to me and I will adjust). New columns carry no foreign keys on purpose, so they
-- cannot create a second relationship that confuses the existing `partner_quotations(*)` embeds.
do $$
declare
  missing text := '';
  need jsonb := '{
    "service_requests": ["id","partner_id","destination","service_type","travel_date","party_size","details","status"],
    "partner_quotations": ["id","service_request_id","net_amount","currency","inclusions"],
    "supplier_bookings": ["id","partner_id","quotation_id","service_description","supplier_name","confirmation_number","status","job_status"],
    "partners": ["id","company_name","email"]
  }';
  t text; c text;
begin
  for t in select jsonb_object_keys(need) loop
    for c in select jsonb_array_elements_text(need -> t) loop
      if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = t and column_name = c) then
        missing := missing || format(' %s.%s', t, c);
      end if;
    end loop;
  end loop;
  if missing <> '' then
    raise exception 'Section 5 stopped. Missing columns:% . Actual columns: %', missing,
      (select string_agg(table_name || '(' || cols || ')', ' | ') from (
         select table_name, string_agg(column_name, ',' order by ordinal_position) cols from information_schema.columns
         where table_schema = 'public' and table_name in ('service_requests','partner_quotations','supplier_bookings','partners') group by table_name) x);
  end if;
end $$;

-- quotation_id must have the same type as quotations.id (uuid or bigint), so build the column from it.
do $$
declare qtype text;
begin
  select format_type(a.atttypid, a.atttypmod) into qtype
  from pg_attribute a where a.attrelid = 'public.quotations'::regclass and a.attname = 'id';
  execute format('alter table public.service_requests add column if not exists quotation_id %s', qtype);
end $$;
alter table public.service_requests   add column if not exists rfq_group uuid;           -- requests sent together to compete
alter table public.service_requests   add column if not exists accepted_at timestamptz;
alter table public.partner_quotations add column if not exists status text not null default 'submitted';
alter table public.partner_quotations add column if not exists valid_until date;
alter table public.partner_quotations add column if not exists submitted_at timestamptz default now();
alter table public.supplier_bookings  add column if not exists service_date date;       -- for partner jobs with no client trip
alter table public.supplier_bookings  add column if not exists cost_amount numeric;     -- accepted partner net price
alter table public.supplier_bookings  add column if not exists cost_currency text;
alter table public.supplier_bookings  add column if not exists source_partner_quotation_id text;
create index if not exists service_requests_rfq_group_idx on public.service_requests (rfq_group);

create or replace function public.accept_partner_quote(p_request_id text, p_quote_id text, p_confirmation text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  r public.service_requests%rowtype;
  q public.partner_quotations%rowtype;
  p public.partners%rowtype;
  v_job text;
  v_closed jsonb := '[]'::jsonb;
begin
  select * into r from public.service_requests where id::text = p_request_id for update;   -- serialises double clicks
  if not found then raise exception 'REQUEST_NOT_FOUND'; end if;
  select * into q from public.partner_quotations where id::text = p_quote_id and service_request_id::text = r.id::text;
  if not found then raise exception 'QUOTE_NOT_FOUND'; end if;

  if r.status = 'accepted' then
    select id::text into v_job from public.supplier_bookings where source_partner_quotation_id::text = q.id::text limit 1;
    return jsonb_build_object('alreadyAccepted', true, 'job_id', v_job);
  end if;
  if r.status = 'closed' then raise exception 'REQUEST_CLOSED'; end if;

  select * into p from public.partners where id::text = r.partner_id::text;

  insert into public.supplier_bookings
    (partner_id, quotation_id, service_description, service_date, supplier_name, confirmation_number,
     status, job_status, cost_amount, cost_currency, source_partner_quotation_id)
  values
    (r.partner_id, r.quotation_id, r.service_type || ' - ' || r.destination, nullif(r.travel_date::text, '')::date,
     p.company_name, p_confirmation, 'Booked', 'Pending', q.net_amount, q.currency, q.id::text)
  returning id::text into v_job;

  update public.partner_quotations set status = 'accepted' where id = q.id;
  update public.partner_quotations set status = 'declined' where service_request_id = r.id and id <> q.id;
  update public.service_requests   set status = 'accepted', accepted_at = now() where id = r.id;

  if r.rfq_group is not null then
    with closed as (
      update public.service_requests set status = 'closed'
      where rfq_group = r.rfq_group and id <> r.id and status <> 'accepted'
      returning id, partner_id)
    select coalesce(jsonb_agg(jsonb_build_object('request_id', closed.id::text, 'partner_id', closed.partner_id::text)), '[]'::jsonb)
      into v_closed from closed;
    update public.partner_quotations set status = 'declined'
    where service_request_id in (select id from public.service_requests where rfq_group = r.rfq_group and id <> r.id);
  end if;

  return jsonb_build_object('alreadyAccepted', false, 'job_id', v_job, 'confirmation_number', p_confirmation,
                            'partner_id', r.partner_id::text, 'closed', v_closed);
end $$;
revoke all on function public.accept_partner_quote(text, text, text) from public, anon, authenticated;
grant execute on function public.accept_partner_quote(text, text, text) to service_role;
