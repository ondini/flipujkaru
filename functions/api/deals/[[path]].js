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

  const upstream = await fetch(`${base}/api/${path}${search}`, {
    headers: auth ? { authorization: auth } : {},
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
  });
}
