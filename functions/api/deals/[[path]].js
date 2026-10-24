import { createClient } from '@supabase/supabase-js';
import { json } from '../../_utils.js';

const DEFAULT_BASE = 'https://fkalgapi.flipujkaru.cz';

/**
 * Cloudflare Pages Function: server-side proxy na algdash API ("Doporučené
 * flipy" v klientské administraci). Algdash má CORS zamčené jen na svou
 * vlastní doménu (https://algdash.flipujkaru.cz), takže fetch přímo z
 * tohoto webu by prohlížeč zablokoval. Proxy běží na serveru (Cloudflare
 * Worker), kam se CORS netýká — jen přeposílá Authorization (Supabase JWT
 * člena, stejný Supabase projekt jako algdash) a query params beze změny.
 */
export async function onRequestGet({ request, env, params }) {
  const base = env.ALGDASH_API_BASE || DEFAULT_BASE;
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || '';
  const search = new URL(request.url).search;
  const auth = request.headers.get('authorization');

  // Algdash ověří jen přihlášení, ne zaplacené členství → hlídáme ho tady.
  // Stejné pravidlo jako has_course_access(): admin, nebo aktivní předplatné.
  const token = (auth || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Nepřihlášeno.' }, 401);
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: userData } = await admin.auth.getUser(token);
  if (!userData?.user) return json({ error: 'Neplatné přihlášení.' }, 401);
  const { data: profile } = await admin
    .from('profiles').select('role, plan, subscription_status').eq('id', userData.user.id).single();
  const allowed = profile?.role === 'admin' || (profile?.plan && profile.subscription_status === 'active');
  if (!allowed) return json({ error: 'Vyžaduje aktivní členství.' }, 403);

  const upstream = await fetch(`${base}/api/${path}${search}`, {
    headers: auth ? { authorization: auth } : {},
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  });
}
