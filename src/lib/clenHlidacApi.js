import { supabase } from './supabase.js';

/* Hlídač pro členy (Dashboard → Můj hlídač). Jde přes /api/clen-hlidac/* (functions/api/clen-hlidac/),
   která ověří předplatné a hlídači pošle, o kterého člena jde. */
async function call(path, { method = 'GET', body, params } = {}) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const qs = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''))}` : '';
  const res = await fetch(`/api/clen-hlidac/${path}${qs}`, {
    method,
    headers: {
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Hlídač odpověděl chybou ${res.status}.`);
    err.offline = Boolean(data.offline);
    throw err;
  }
  return data;
}

export const clenHlidacApi = {
  watchers: () => call('watchers'),
  found: (limit = 60) => call('found', { params: { limit } }),
  brands: () => call('brands'),
  models: (brand) => call('models', { params: { brand } }),
  save: (watcher) => call('watchers', { method: 'POST', body: { watcher } }),
  remove: (id) => call('watchers/delete', { method: 'POST', body: { id } }),
};
