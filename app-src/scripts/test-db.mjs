// Runs the migration and the security tests on PGlite (Postgres in WebAssembly). No Docker needed.
//   node scripts/test-db.mjs
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const db = new PGlite();
const clean = (s) => s.replace(/create extension[^;]*;/gi, '');
await db.exec(clean(readFileSync('supabase/tests/auth_shim.sql', 'utf8')));
await db.exec(clean(readFileSync('supabase/migrations/20261122000000_core.sql', 'utf8')));
await db.exec(`create or replace function public.as_user_shim(u uuid) returns void language sql as
  $$ select set_config('request.jwt.claim.sub', u::text, false); select null::void $$;
  grant execute on function public.as_user_shim(uuid) to anon, authenticated;`);

// Split the psql-style test file into statements, respecting $$ blocks and psql's \gset.
function split(text) {
  const out = []; let buf = ''; let inDollar = false;
  for (const line of text.split(/\r?\n/)) {
    if (!inDollar && (line.startsWith('--') || line.startsWith('\\set') || !line.trim())) continue;
    if (/^create or replace function pg_temp/i.test(line)) { buf = '__skip__'; }
    buf += (buf ? '\n' : '') + line;
    const dollars = (line.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    if (inDollar) continue;
    const t = line.trimEnd();
    if (t.endsWith('\\gset')) { out.push({ sql: buf.replace(/\\gset\s*$/, '').trim(), gset: true }); buf = ''; }
    else if (t.endsWith(';')) { out.push({ sql: buf.trim().replace(/;$/, ''), gset: false }); buf = ''; }
  }
  return out.filter(s => !s.sql.startsWith('__skip__'));
}

const vars = {};
for (const { sql, gset } of split(readFileSync('supabase/tests/rls_test.sql', 'utf8'))) {
  const s = sql.replace(/:'(\w+)'/g, (_, k) => `'${vars[k]}'`).replace(/pg_temp\.as_user/g, 'public.as_user_shim');
  try {
    const r = await db.query(s);
    if (gset && r.rows[0]) Object.assign(vars, r.rows[0]);
    if (r.rows[0]?.result) console.log(r.rows[0].result);
  } catch (e) {
    console.error('FAILED STATEMENT:\n' + s.slice(0, 400) + '\n-> ' + e.message);
    await db.close(); process.exit(1);
  }
}
await db.close();
