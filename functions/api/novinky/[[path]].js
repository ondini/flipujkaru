import { createClient } from '@supabase/supabase-js';
import { json } from '../../_utils.js';

/**
 * Cloudflare Pages Function: admin webu → bot novinek a zákonů na Macu (Cloudflare Tunnel novinky-api.flipujkaru.cz).
 * Stejná ochrana jako /api/hlidac: jen přihlášený ADMIN (role v profiles), jen vyjmenované adresy, limit velikosti,
 * botovi jde tajný klíč NOVINKY_KEY, JWT uživatele dál nejde.
 * Proměnné prostředí (secret): NOVINKY_URL, NOVINKY_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
 */
const ROUTES = { GET: ['prehled', 'pribehy'], POST: ['akce', 'kolo'] };
const MAX_BODY = 16 * 1024;
const TIMEOUT_MS = 90000; // schválení čeká na nasazení článku na web (desítky sekund)

export async function onRequest({ request, env, params }) {
  const method = request.method;
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
  if (!ROUTES[method]) return json({ error: 'Metoda není povolená.' }, 405);
  if (!ROUTES[method].includes(path)) return json({ error: 'Neznámá adresa.' }, 404);
  if (!env.NOVINKY_URL || !env.NOVINKY_KEY || !env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    return json({ error: 'Novinky nejsou na webu nastavené.' }, 503);
  }

  if (method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Zakázáno.' }, 403);
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Nepřihlášeno.' }, 401);
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
  const sekce = new URL(request.url).searchParams.get('sekce');
  const qs = sekce ? `?sekce=${encodeURIComponent(sekce.slice(0, 20))}` : '';

  let upstream;
  try {
    upstream = await fetch(`${env.NOVINKY_URL.replace(/\/$/, '')}/api/${path}${qs}`, {
      method,
      body,
      headers: { 'x-novinky-key': env.NOVINKY_KEY, ...(body ? { 'content-type': 'application/json' } : {}) },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    if (e?.name === 'TimeoutError') {
      return json({ error: 'Bot neodpověděl do 90 s. Akce možná doběhla, za chvíli obnov seznam a zkontroluj stav.' }, 504);
    }
    return json({ error: 'Bot novinek je teď nedostupný (Mac spí nebo je vypnutý).', offline: true }, 503);
  }
  if (upstream.status >= 502) return json({ error: 'Bot novinek je teď nedostupný (Mac spí nebo je vypnutý).', offline: true }, 503);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
