-- Runs against plain Postgres with a tiny stand-in for Supabase's auth schema.
-- Usage: see scripts/test-db.sh. Every check raises on failure.
\set ON_ERROR_STOP on

create or replace function pg_temp.as_user(u uuid) returns void language sql as
$$ select set_config('request.jwt.claim.sub', u::text, false); select null::void $$;

-- three people: owner A, tech A, owner B
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select public.create_company('Prairie Tire Service', 'AB', 'Owner A') as ca \gset
reset role;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
select public.create_company('Other Co', 'ON', 'Owner B') as cb \gset
reset role;

-- owner A adds a tech, a fleet, a price, and a job assigned to the tech
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
insert into public.members(company_id, user_id, role, display_name) values (:'ca', '00000000-0000-0000-0000-0000000000c1', 'tech', 'Marc');
insert into public.fleets(company_id, name, po_required) values (:'ca', 'Northline', true) returning id as fa \gset
insert into public.price_items(company_id, kind, code, description, size, unit, price_cents) values (:'ca', 'tire', 'T1', '11R22.5', '11R22.5', 'each', 61200);
insert into public.jobs(company_id, number, fleet_id, unit, province, tech_user_id, status) values (:'ca', 1001, :'fa', '4521', 'AB', '00000000-0000-0000-0000-0000000000c1', 'dispatched') returning id as ja \gset
insert into public.jobs(company_id, number, province, status) values (:'ca', 1002, 'AB', 'new') returning id as ja2 \gset
reset role;

-- 1. owner B cannot see company A's data
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
set role authenticated;
do $$ begin
  if (select count(*) from public.jobs) <> 0 then raise exception 'FAIL: B sees A jobs'; end if;
  if (select count(*) from public.price_items) <> 0 then raise exception 'FAIL: B sees A prices'; end if;
  if (select count(*) from public.companies) <> 1 then raise exception 'FAIL: B sees other companies'; end if;
end $$;
-- and cannot approve A's job
do $$ begin
  begin perform public.approve_job((select id from public.jobs limit 1)); exception when others then null; end;
end $$;
reset role;

-- 2. the tech sees only the assigned job, can record it, cannot change PO or approve
select pg_temp.as_user('00000000-0000-0000-0000-0000000000c1');
set role authenticated;
do $$ begin
  if (select count(*) from public.jobs) <> 1 then raise exception 'FAIL: tech should see exactly 1 job'; end if;
end $$;
update public.jobs set transcript = 'Unit 4521 steer left...', status = 'recorded' where id = :'ja';
insert into public.job_lines(job_id, company_id, description, qty, unit_price_cents) values (:'ja', :'ca', '11R22.5', 1, 61200);
do $$ declare ok boolean := false; begin
  begin update public.jobs set po = 'HACK' where number = 1001; exception when others then ok := true; end;
  if not ok then raise exception 'FAIL: tech changed PO'; end if;
end $$;
do $$ declare ok boolean := false; begin
  begin update public.jobs set status = 'approved' where number = 1001; exception when others then ok := true; end;
  if not ok then raise exception 'FAIL: tech approved by status update'; end if;
end $$;
do $$ declare ok boolean := false; begin
  begin perform public.approve_job((select id from public.jobs where number = 1001)); exception when others then ok := true; end;
  if not ok then raise exception 'FAIL: tech approved through approve_job'; end if;
end $$;
do $$ declare ok boolean := false; begin
  begin insert into public.audit_log(company_id, action, user_id) values ((select company_id from public.jobs limit 1), 'fake', '00000000-0000-0000-0000-00000000000a'); exception when others then ok := true; end;
  if not ok then raise exception 'FAIL: tech wrote audit row as someone else'; end if;
end $$;
reset role;

-- 3. owner approves: invoice number assigned, lines frozen, audit row written
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
set role authenticated;
select public.approve_job(:'ja') as inv \gset
do $$ begin
  if (select invoice_no from public.jobs where number = 1001) <> 'INV-1001' then raise exception 'FAIL: invoice number'; end if;
  if (select next_invoice_no from public.companies limit 1) <> 1002 then raise exception 'FAIL: counter'; end if;
  if not exists(select 1 from public.audit_log where action = 'invoice_approved') then raise exception 'FAIL: audit'; end if;
end $$;
do $$ declare ok boolean := false; begin
  begin update public.job_lines set unit_price_cents = 1 where description = '11R22.5'; exception when others then ok := true; end;
  if not ok then raise exception 'FAIL: approved lines changed'; end if;
end $$;
do $$ declare ok boolean := false; begin
  begin update public.audit_log set action = 'x'; exception when others then ok := true; end;
  if (select count(*) from public.audit_log where action = 'x') > 0 then raise exception 'FAIL: audit edited'; end if;
end $$;
reset role;

-- 4. anonymous users see nothing
set role anon;
do $$ begin
  begin
    if (select count(*) from public.jobs) <> 0 then raise exception 'FAIL: anon sees jobs'; end if;
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select 'ALL RLS CHECKS PASSED' as result;
