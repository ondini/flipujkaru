import { supabase } from './supabase.js';

/* ============================================================
   Klient pro API algoritmu „Doporučené flipy" (algdash).
   Jde přes server-side proxy /api/deals/* (functions/api/deals/),
   protože algdash API má CORS zamčené jen na svou vlastní doménu —
   proxy poběží na Cloudflare Workeru, kam se to netýká, a přeposílá
   Supabase JWT přihlášeného člena (stejný Supabase projekt jako algdash).
============================================================ */

function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

async function get(path, params) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const res = await fetch(`/api/deals${path}${buildQuery(params)}`, {
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`API ${path} selhalo: ${res.status}`);
  }
  return res.json();
}

export const dealsApi = {
  undervalued: (params) => get('/undervalued', params),
  undervaluedDetail: (externalId) => get(`/undervalued/${encodeURIComponent(externalId)}`),
  mobiledeManufacturers: () => get('/meta/mobilede/manufacturers'),
  mobiledeModels: (manufacturer) => get('/meta/mobilede/models', { manufacturer }),
};
