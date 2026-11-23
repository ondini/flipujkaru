import { createClient } from '@supabase/supabase-js';
import { json } from '../../_utils.js';

/**
 * Cloudflare Pages Function: jediná cesta z adminu webu k hlídači inzerátů (běží na Macu, spojení přes Cloudflare Tunnel).
 * Pustí jen přihlášeného ADMINA (role v profiles), jen vyjmenované adresy a s limitem velikosti.
 * Hlídači pošle tajný klíč HLIDAC_KEY (zná ho jen tahle funkce a hlídač), JWT uživatele dál nepřeposílá.
 * Admina ověří jeho vlastním přihlášením (veřejný klíč + JWT, RLS profiles_select_own), service role klíč nepotřebuje.
 * Roli si uživatel změnit nesmí (supabase/profiles_lockdown.sql).
 * Proměnné prostředí: HLIDAC_URL, HLIDAC_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
 */
const ROUTES = {
  GET: ['config', 'overview', 'alerts', 'portals', 'brands', 'models', 'suggest', 'telegram', 'delivery'],
  POST: ['config', 'telegram', 'telegram/preview', 'delivery'],
};
const MAX_BODY = 256 * 1024;
const TIMEOUT_MS = 20000;

export async function onRequest({ request, env, params }) {
  const method = request.method;
  const path = (Array.isArray(params.path) ? params.path.join('/') : params.path || '');
  if (!ROUTES[method]) return json({ error: 'Metoda není povolená.' }, 405);
  if (!ROUTES[method].includes(path)) return json({ error: 'Neznámá adresa.' }, 404);
  if (!env.HLIDAC_URL || !env.HLIDAC_KEY) return json({ error: 'Hlídač není na webu nastavený.' }, 503);

  // Zápis jen ze stránky tohoto webu (druhá pojistka vedle tokenu).
  if (method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Zakázáno.' }, 403);
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Nepřihlášeno.' }, 401);
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return json({ error: 'Hlídač není na webu nastavený.' }, 503);
  const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData } = await sb.auth.getUser(token);
  if (!userData?.user) return json({ error: 'Neplatné přihlášení.' }, 401);
  const { data: profile } = await sb.from('profiles').select('role').eq('id', userData.user.id).single();
  if (profile?.role !== 'admin') return json({ error: 'Jen pro administrátory.' }, 403);

  let body;
  if (method === 'POST') {
    body = await request.text();
    if (body.length > MAX_BODY) return json({ error: 'Požadavek je moc velký.' }, 413);
  }

  // Z dotazu jen známé parametry (značka, model, počet).
  const inQs = new URL(request.url).searchParams;
  const qs = new URLSearchParams();
  for (const k of ['brand', 'model', 'limit']) if (inQs.has(k)) qs.set(k, inQs.get(k).slice(0, 60));

  let upstream;
  try {
    upstream = await fetch(`${env.HLIDAC_URL.replace(/\/$/, '')}/api/${path}${qs.size ? `?${qs}` : ''}`, {
      method,
      body,
      headers: { 'x-hlidac-key': env.HLIDAC_KEY, ...(body ? { 'content-type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return json({ error: 'Hlídač je teď nedostupný (Mac spí nebo je vypnutý).', offline: true }, 503);
  }
  if (upstream.status >= 500 && upstream.status !== 500) {
    return json({ error: 'Hlídač je teď nedostupný (Mac spí nebo je vypnutý).', offline: true }, 503);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
