import { supabase } from './supabase.js';

/* Klient bota novinek a zákonů (admin → Novinky). Jde přes /api/novinky/* (functions/api/novinky/), jen admin. */
async function call(path, { method = 'GET', body, params } = {}) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`/api/novinky/${path}${qs}`, {
    method,
    headers: {
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Bot novinek odpověděl chybou ${res.status}.`);
    err.offline = Boolean(data.offline);
    throw err;
  }
  return data;
}

export const novinkyApi = {
  prehled: () => call('prehled'),
  pribehy: (sekce) => call('pribehy', { params: { sekce } }),
  schvalit: (id) => call('akce', { method: 'POST', body: { akce: 'ok', id } }),
  zamitnout: (id) => call('akce', { method: 'POST', body: { akce: 'no', id } }),
  prepsat: (id, pokyn) => call('akce', { method: 'POST', body: { akce: 're', id, pokyn } }),
  kolo: () => call('kolo', { method: 'POST' }),
};
