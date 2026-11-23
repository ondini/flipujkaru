import { createClient } from '@supabase/supabase-js';
import { json } from '../../_utils.js';

/**
 * Cloudflare Pages Function: hlídač pro členy (Dashboard → Můj hlídač).
 * Pustí jen přihlášeného člena s aktivním předplatným (nebo admina), stejně jako /api/deals.
 * Hlídači pošle tajný klíč HLIDAC_KEY a ověřené id a e-mail člena (X-Member-Id, X-Member-Email);
 * hlídač podle nich člena pozná, prohlížeč s ním nemluví napřímo a cizí id podstrčit nemůže.
 * Proměnné prostředí: HLIDAC_URL, HLIDAC_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
const ROUTES = {
  GET: { watchers: 'member/watchers', found: 'member/found', brands: 'brands', models: 'models' },
  POST: { watchers: 'member/watchers', 'watchers/delete': 'member/watchers/delete' },
};
const MAX_BODY = 16 * 1024;
const TIMEOUT_MS = 20000;
const OFFLINE = { error: 'Hlídač je teď nedostupný, zkus to prosím za chvíli.', offline: true };

export async function onRequest({ request, env, params }) {
  const method = request.method;
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
  if (!ROUTES[method]) return json({ error: 'Metoda není povolená.' }, 405);
  const target = ROUTES[method][path];
  if (!target) return json({ error: 'Neznámá adresa.' }, 404);
  if (!env.HLIDAC_URL || !env.HLIDAC_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Hlídač není na webu nastavený.' }, 503);

  if (method === 'POST') {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Zakázáno.' }, 403);
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Nepřihlášeno.' }, 401);
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user?.email) return json({ error: 'Neplatné přihlášení.' }, 401);
  const { data: profile } = await admin
    .from('profiles').select('role, plan, subscription_status').eq('id', user.id).single();
  const allowed = profile?.role === 'admin' || (profile?.plan && profile.subscription_status === 'active');
  if (!allowed) return json({ error: 'Hlídač je pro členy s aktivním předplatným.' }, 403);

  let body;
  if (method === 'POST') {
    body = await request.text();
    if (body.length > MAX_BODY) return json({ error: 'Požadavek je moc velký.' }, 413);
  }
  const inQs = new URL(request.url).searchParams;
  const qs = new URLSearchParams();
  for (const k of ['brand', 'limit']) if (inQs.has(k)) qs.set(k, inQs.get(k).slice(0, 60));

  let upstream;
  try {
    upstream = await fetch(`${env.HLIDAC_URL.replace(/\/$/, '')}/api/${target}${qs.size ? `?${qs}` : ''}`, {
      method,
      body,
      headers: {
        'x-hlidac-key': env.HLIDAC_KEY,
        'x-member-id': user.id,
        'x-member-email': user.email,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return json(OFFLINE, 503);
  }
  if (upstream.status > 500) return json(OFFLINE, 503);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
