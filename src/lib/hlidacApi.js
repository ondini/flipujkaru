import { supabase } from './supabase.js';

/* ============================================================
   Klient hlídače inzerátů (admin → Hlídač). Jde přes /api/hlidac/*
   (functions/api/hlidac/), která pustí jen admina a hlídači na Macu
   pošle tajný klíč. Prohlížeč s hlídačem nikdy nemluví napřímo.
============================================================ */
async function call(path, { method = 'GET', body, params } = {}) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const qs = params ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v != null && v !== ''))}` : '';
  const res = await fetch(`/api/hlidac/${path}${qs}`, {
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

export const hlidacApi = {
  config: () => call('config'),
  saveConfig: (cfg) => call('config', { method: 'POST', body: { watch: cfg.watch, costs: cfg.costs } }),
  overview: () => call('overview'),
  alerts: (limit = 200) => call('alerts', { params: { limit } }),
  portals: () => call('portals'),
  brands: () => call('brands'),
  models: (brand) => call('models', { params: { brand } }),
  suggest: (brand, model) => call('suggest', { params: { brand, model } }),
  telegram: () => call('telegram'),
  saveTelegram: (template) => call('telegram', { method: 'POST', body: { template } }),
  previewTelegram: (template) => call('telegram/preview', { method: 'POST', body: { template } }),
  delivery: () => call('delivery'),
  saveDelivery: (settings) => call('delivery', { method: 'POST', body: { settings } }),
};
