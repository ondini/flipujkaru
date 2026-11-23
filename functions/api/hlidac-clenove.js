import { createClient } from '@supabase/supabase-js';
import { json } from '../_utils.js';

/**
 * Cloudflare Pages Function: hlídač se jednou za 15 minut zeptá, kterým jeho členům ještě běží předplatné.
 * Pošle {ids: [...]} a tajný klíč v hlavičce x-hlidac-key, dostane {active: {id: e-mail}} jen aktivních.
 * Komu předplatné propadne, tomu hlídač přestane hledat i posílat e-maily.
 * Proměnné prostředí: HLIDAC_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
const MAX_IDS = 5000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function sameKey(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.HLIDAC_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Není nastavené.' }, 503);
  if (!sameKey(request.headers.get('x-hlidac-key') || '', env.HLIDAC_KEY)) return json({ error: 'Zakázáno.' }, 403);
  const raw = await request.text();
  if (raw.length > 256 * 1024) return json({ error: 'Požadavek je moc velký.' }, 413);
  let ids;
  try { ids = JSON.parse(raw).ids; } catch { return json({ error: 'Neplatný požadavek.' }, 400); }
  if (!Array.isArray(ids)) return json({ error: 'Chybí ids.' }, 400);
  ids = [...new Set(ids.filter((x) => typeof x === 'string' && UUID.test(x)))].slice(0, MAX_IDS);

  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const active = {};
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await admin
      .from('profiles').select('id, email, role, plan, subscription_status').in('id', ids.slice(i, i + 200));
    if (error) return json({ error: 'Databáze neodpověděla.' }, 502);
    for (const p of data || []) {
      if (p.email && (p.role === 'admin' || (p.plan && p.subscription_status === 'active'))) active[p.id] = p.email;
    }
  }
  return json({ active });
}
