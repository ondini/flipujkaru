/* ============================================================
   Prerender (SSG) — běží při buildu v Node (scripts/prerender.mjs).
   Vyrenderuje stránku do HTML + sestaví <head> (title, popis, canonical,
   Open Graph, JSON-LD), ať vyhledávače i náhledy odkazů vidí obsah bez JS.
============================================================ */
import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { setSsrPath } from './lib/router.js';
import { setSsrData } from './lib/initialData.js';
import { FAQ } from './data/content.js';
import { BILLING_OPTIONS } from './config/billing.js';
import { SELL_FAQ } from './config/sell.js';
import {
  PAGES, NOT_FOUND, matchRoute, headTags,
  organizationLd, websiteLd, faqLd, sellServiceLd, courseLd, membershipLd,
} from './seo/site.js';

/** FAQ prodeje auta — stejné jako na stránce (prázdné odpovědi se nezobrazují). */
const sellFaq = (t) => SELL_FAQ.map((f) => ({ q: f.q, a: (t[f.key] || f.fallback || '').trim() })).filter((f) => f.a);

function structuredData(key, siteText) {
  const org = organizationLd();
  switch (key) {
    case '/': return [org, websiteLd(), faqLd(sellFaq(siteText))]; // na úvodu je jen sekce prodeje auta s dotazy
    case '/prodej-auta': return [org, sellServiceLd(), faqLd(sellFaq(siteText))];
    case '/prodej-auta/formular': return [org, sellServiceLd()];
    case '/akademie': return [org, courseLd()];
    case '/cenik': return [org, membershipLd(BILLING_OPTIONS), faqLd(FAQ)];
    default: return [org];
  }
}

export function render(path, data = {}) {
  setSsrPath(path);
  setSsrData(data);
  const route = matchRoute(path);
  const notFound = route.key === 'notfound';
  const meta = notFound ? NOT_FOUND : PAGES[route.key];
  const html = renderToString(<App />);
  const head = headTags({
    title: meta.title,
    description: meta.description,
    path: route.path,
    noindex: notFound,
    ld: notFound ? [] : structuredData(route.key, data.siteText || {}),
  });
  return { html, head };
}
