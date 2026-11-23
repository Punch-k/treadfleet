-- TreadFleet core schema. Every row belongs to a company; row-level security keeps companies apart.
-- Roles inside a company: owner (approves and sends), office (prepares), tech (records jobs assigned to them).

create extension if not exists pgcrypto;

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  province text not null check (province in ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')),
  gst_number text, qst_number text, address text, phone text, email text,
  invoice_prefix text not null default 'INV-',
  next_invoice_no integer not null default 1001 check (next_invoice_no > 0),
  default_lang text not null default 'en' check (default_lang in ('en','fr')),
  retorque_km integer not null default 80 check (retorque_km between 10 and 1000),
  tax_rates jsonb,                                   -- null = Canadian defaults in the app
  created_at timestamptz not null default now()
);

create table public.members (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','office','tech')),
  display_name text,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);
create index on public.members(user_id);

-- Helpers used by policies. security definer so they can read members without recursive RLS.
create or replace function public.is_member(c uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.members m where m.company_id = c and m.user_id = auth.uid()) $$;
create or replace function public.has_role(c uuid, roles text[]) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.members m where m.company_id = c and m.user_id = auth.uid() and m.role = any(roles)) $$;

create table public.fleets (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null, ap_email text,
  po_required boolean not null default true,
  po_pattern text, notes text,
  created_at timestamptz not null default now()
);
create index on public.fleets(company_id);

create table public.price_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  kind text not null check (kind in ('tire','labour','service','fee','credit')),
  code text not null, description text not null, size text,
  unit text not null default 'each' check (unit in ('each','hour','job')),
  price_cents integer not null check (price_cents >= 0),
  aliases text[] not null default '{}',
  taxable boolean not null default true,
  active boolean not null default true,
  unique (company_id, code)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  number integer not null,
  fleet_id uuid references public.fleets(id) on delete set null,
  unit text, po text, location text, description text,
  type text not null default 'road_call' check (type in ('road_call','yard_check','shop')),
  status text not null default 'new' check (status in ('new','dispatched','recorded','review','approved','sent','closed')),
  tech_user_id uuid, tech_name text,
  province text not null,
  transcript text, audio_path text, extracted jsonb,
  invoice_no text, approved_at timestamptz, approved_by uuid, sent_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (company_id, number), unique (company_id, invoice_no)
);
create index on public.jobs(company_id, status);
create index on public.jobs(tech_user_id);

create table public.job_lines (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  price_item_id uuid references public.price_items(id) on delete set null,
  description text not null,
  qty numeric(10,2) not null default 1,
  unit_price_cents integer not null,           -- negative for credits
  taxable boolean not null default true,
  evidence text, needs_review boolean not null default false,
  sort integer not null default 0
);
create index on public.job_lines(job_id);

create table public.torque_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  axle text not null check (axle in ('steer','drive','trailer')), axle_no smallint, side text not null check (side in ('left','right')), pos text check (pos in ('inner','outer')),
  value_ft_lb integer not null check (value_ft_lb > 0),
  pattern text, tech_name text,
  recorded_at timestamptz not null default now(),
  retorque_due_km integer not null default 80,
  retorque_confirmed_at timestamptz
);
create index on public.torque_records(job_id);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  path text not null, position jsonb,
  created_at timestamptz not null default now()
);

-- Append-only record of who did what.
create table public.audit_log (
  id bigserial primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  action text not null,
  detail jsonb
);
create index on public.audit_log(company_id, at desc);

-- ---------- row-level security ----------
alter table public.companies enable row level security;
alter table public.members enable row level security;
alter table public.fleets enable row level security;
alter table public.price_items enable row level security;
alter table public.jobs enable row level security;
alter table public.job_lines enable row level security;
alter table public.torque_records enable row level security;
alter table public.photos enable row level security;
alter table public.audit_log enable row level security;

create policy companies_read on public.companies for select to authenticated using (public.is_member(id));
create policy companies_owner_update on public.companies for update to authenticated using (public.has_role(id, array['owner'])) with check (public.has_role(id, array['owner']));

create policy members_read on public.members for select to authenticated using (public.is_member(company_id));
create policy members_owner_write on public.members for all to authenticated using (public.has_role(company_id, array['owner'])) with check (public.has_role(company_id, array['owner']));

create policy fleets_read on public.fleets for select to authenticated using (public.is_member(company_id));
create policy fleets_write on public.fleets for all to authenticated using (public.has_role(company_id, array['owner','office'])) with check (public.has_role(company_id, array['owner','office']));

create policy prices_read on public.price_items for select to authenticated using (public.is_member(company_id));
create policy prices_write on public.price_items for all to authenticated using (public.has_role(company_id, array['owner','office'])) with check (public.has_role(company_id, array['owner','office']));

-- Office sees every job; a tech sees only jobs assigned to them.
create or replace function public.can_see_job(j public.jobs) returns boolean language sql stable security definer set search_path = public as
$$ select public.has_role(j.company_id, array['owner','office']) or (j.tech_user_id = auth.uid() and public.is_member(j.company_id)) $$;
create or replace function public.can_see_job_id(jid uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists(select 1 from public.jobs j where j.id = jid and public.can_see_job(j)) $$;

create policy jobs_read on public.jobs for select to authenticated using (public.can_see_job(jobs));
create policy jobs_office_insert on public.jobs for insert to authenticated with check (public.has_role(company_id, array['owner','office']));
create policy jobs_update on public.jobs for update to authenticated using (public.can_see_job(jobs)) with check (public.is_member(company_id));
create policy jobs_owner_delete on public.jobs for delete to authenticated using (public.has_role(company_id, array['owner']));

create policy lines_all on public.job_lines for all to authenticated using (public.can_see_job_id(job_id)) with check (public.can_see_job_id(job_id) and public.is_member(company_id));
create policy torque_all on public.torque_records for all to authenticated using (public.can_see_job_id(job_id)) with check (public.can_see_job_id(job_id) and public.is_member(company_id));
create policy photos_all on public.photos for all to authenticated using (public.can_see_job_id(job_id)) with check (public.can_see_job_id(job_id) and public.is_member(company_id));

create policy audit_insert on public.audit_log for insert to authenticated with check (public.is_member(company_id) and user_id = auth.uid());
create policy audit_read on public.audit_log for select to authenticated using (public.has_role(company_id, array['owner','office']));
-- no update/delete policy on audit_log: it can only grow.

-- ---------- guard rails ----------
-- Techs can't change money, invoice or approval fields; nobody can approve except through approve_job().
create or replace function public.jobs_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if new.company_id <> old.company_id or new.number <> old.number then raise exception 'job identity is fixed'; end if;
  if current_setting('treadfleet.approving', true) is distinct from 'on' then
    if new.invoice_no is distinct from old.invoice_no or new.approved_at is distinct from old.approved_at or new.approved_by is distinct from old.approved_by then
      raise exception 'invoices are approved only through approve_job()';
    end if;
    if new.status in ('approved','sent','closed') and old.status not in ('approved','sent','closed') then
      raise exception 'invoices are approved only through approve_job()';
    end if;
  end if;
  if not public.has_role(old.company_id, array['owner','office']) then
    if new.fleet_id is distinct from old.fleet_id or new.po is distinct from old.po or new.tech_user_id is distinct from old.tech_user_id or new.province <> old.province then
      raise exception 'technicians can only record the job';
    end if;
    if new.status not in ('dispatched','recorded','review') then raise exception 'technicians can only record the job'; end if;
  end if;
  return new;
end $$;
create trigger jobs_guard before update on public.jobs for each row execute function public.jobs_guard();

-- Lines on an approved invoice are frozen.
create or replace function public.lines_frozen() returns trigger language plpgsql security definer set search_path = public as $$
declare st text;
begin
  select status into st from public.jobs where id = coalesce(new.job_id, old.job_id);
  if st in ('approved','sent','closed') then raise exception 'this invoice is approved and can no longer change'; end if;
  return coalesce(new, old);
end $$;
create trigger lines_frozen before insert or update or delete on public.job_lines for each row execute function public.lines_frozen();

-- ---------- functions the app calls ----------
create or replace function public.create_company(p_name text, p_province text, p_display_name text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  insert into public.companies(name, province) values (p_name, p_province) returning id into cid;
  insert into public.members(company_id, user_id, role, display_name) values (cid, auth.uid(), 'owner', p_display_name);
  insert into public.audit_log(company_id, action, detail) values (cid, 'company_created', jsonb_build_object('name', p_name));
  return cid;
end $$;

create or replace function public.next_job_number(p_company uuid) returns integer language sql stable security definer set search_path = public as
$$ select coalesce(max(number), 1000) + 1 from public.jobs where company_id = p_company $$;

-- The only way to approve: owner only, assigns the next invoice number atomically, logs it.
create or replace function public.approve_job(p_job uuid) returns text language plpgsql security definer set search_path = public as $$
declare j public.jobs; c public.companies; inv text;
begin
  select * into j from public.jobs where id = p_job for update;
  if not found then raise exception 'job not found'; end if;
  if not public.has_role(j.company_id, array['owner']) then raise exception 'only the owner can approve'; end if;
  if j.status in ('approved','sent','closed') then return j.invoice_no; end if;
  if not exists(select 1 from public.job_lines where job_id = j.id) then raise exception 'no lines to invoice'; end if;
  update public.companies set next_invoice_no = next_invoice_no + 1 where id = j.company_id returning * into c;
  inv := c.invoice_prefix || (c.next_invoice_no - 1)::text;
  perform set_config('treadfleet.approving', 'on', true);
  update public.jobs set status = 'approved', invoice_no = inv, approved_at = now(), approved_by = auth.uid() where id = j.id;
  perform set_config('treadfleet.approving', 'off', true);
  insert into public.audit_log(company_id, job_id, action, detail) values (j.company_id, j.id, 'invoice_approved', jsonb_build_object('invoice_no', inv));
  return inv;
end $$;

revoke all on function public.approve_job(uuid) from public, anon;
revoke all on function public.create_company(text, text, text) from public, anon;
grant execute on function public.approve_job(uuid) to authenticated;
grant execute on function public.create_company(text, text, text) to authenticated;
grant execute on function public.next_job_number(uuid) to authenticated;
