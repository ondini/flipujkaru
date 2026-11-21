/* ============================================================
   SEO — sdílené (prohlížeč, prerender při buildu, Cloudflare funkce).
   Čisté JS bez Reactu a bez import.meta.env, ať jde importovat odkudkoli.
============================================================ */

export const SITE_URL = 'https://www.flipujkaru.cz';
export const SITE_NAME = 'FlipujKáru';
export const OG_IMAGE = `${SITE_URL}/og.png`;

/** Statické stránky: cesta → title, description (+ sitemap priorita). */
export const PAGES = {
  '/': {
    title: 'FlipujKáru — prověřená auta a komunita car flipperů',
    description: 'Nauč se kupovat a prodávat auta se ziskem. Know-how, scanner aut pod cenou napříč Evropou, komunita 1 800+ flipperů a provize za doporučení. Prověřená auta i prodej tvého auta.',
    priority: '1.0', changefreq: 'daily',
  },
  '/bazar': {
    title: 'Bazar prověřených aut | FlipujKáru',
    description: 'Prověřená ojetá auta s ověřenou historií, kontrolou VIN a kompletními papíry. Podívej se, co máme právě na prodej.',
    priority: '0.9', changefreq: 'daily',
  },
  '/nase-flipy': {
    title: 'Naše flipy — prodaná auta a jejich příběhy | FlipujKáru',
    description: 'Skutečná auta, která jsme koupili, opravili a prodali se ziskem. Nákupní cena, náklady na opravu i výsledek.',
    priority: '0.7', changefreq: 'weekly',
  },
  '/prodej-auta': {
    title: 'Prodáme ti auto — prodej auta za tebe | FlipujKáru',
    description: 'Prodáme tvé auto za tebe. Dohodnutou cenu dostaneš celou, provizi platí kupec. Inzerce, zájemci, zkušební jízdy i přepis. Nacenění zdarma.',
    priority: '0.9', changefreq: 'monthly',
  },
  '/prodej-auta/formular': {
    title: 'Nezávazné nacenění auta | FlipujKáru',
    description: 'Pošli nám fotky a základní údaje o autě a řekneme ti reálnou prodejní cenu. Zdarma a nezávazně.',
    priority: '0.6', changefreq: 'monthly',
  },
  '/akademie': {
    title: 'Car-flipping akademie — nauč se vydělávat na autech | FlipujKáru',
    description: 'Nauč se hledat podhodnocená auta, opravit je a prodat se ziskem. Kurzy, algoritmus na podhodnocené nabídky a podpora při prvním flipu.',
    priority: '0.8', changefreq: 'monthly',
  },
  '/kalkulacka': {
    title: 'Kalkulačka zisku z flipu auta | FlipujKáru',
    description: 'Spočítej si, kolik vyděláš na koupi, opravě a prodeji auta. Nákup, náklady, daně a čistý zisk na jednom místě.',
    priority: '0.7', changefreq: 'monthly',
  },
  '/cenik': {
    title: 'Členství — ceník, osobní servis a časté dotazy | FlipujKáru',
    description: 'Členství FlipujKáru: měsíční, čtyřměsíční i roční (3 999 Kč). Know-how, scanner aut pod cenou, komunita a provize. Osobní 1:1 servis a odpovědi na časté dotazy.',
    priority: '0.8', changefreq: 'monthly',
  },
  '/obchodni-podminky': {
    title: 'Obchodní podmínky | FlipujKáru',
    description: 'Obchodní podmínky členství v akademii FlipujKáru (Nutriverse s.r.o.).',
    priority: '0.2', changefreq: 'yearly',
  },
  '/cookies': {
    title: 'Zásady cookies | FlipujKáru',
    description: 'Jaké cookies web FlipujKáru používá a jak je můžeš spravovat.',
    priority: '0.2', changefreq: 'yearly',
  },
  '/gdpr': {
    title: 'Ochrana osobních údajů (GDPR) | FlipujKáru',
    description: 'Jak FlipujKáru (Nutriverse s.r.o.) zpracovává a chrání osobní údaje.',
    priority: '0.2', changefreq: 'yearly',
  },
};

export const NOT_FOUND = {
  title: 'Stránka nenalezena | FlipujKáru',
  description: 'Tahle stránka tu není. Zkus bazar, prodej auta, akademii nebo členství.',
};

export const LEGAL_SLUGS = ['obchodni-podminky', 'cookies', 'gdpr'];

/** Normalizace cesty (bez koncového lomítka, kromě kořene). */
export const normalizePath = (p) => {
  const s = (p || '/').split(/[?#]/)[0];
  return s.length > 1 ? s.replace(/\/+$/, '') : '/';
};

/** Rozpozná trasu: { key, path, slug? } — key 'notfound' pro neznámé. */
export function matchRoute(rawPath) {
  const path = normalizePath(rawPath);
  if (PAGES[path]) return { key: path, path };
  const m = path.match(/^\/auto\/([a-z0-9-]+)$/);
  if (m) return { key: '/auto', path, slug: m[1] };
  return { key: 'notfound', path };
}

/* ---------- Auta ---------- */

export const slugify = (s) =>
  String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const ID_LEN = 6;
/** /auto/skoda-octavia-rs-2021-803a3e — název pro lidi a Google + kousek ID pro jednoznačnost. */
export const carSlug = (car) => `${slugify(`${car.brand} ${car.model} ${car.year || ''}`)}-${String(car.id).replace(/-/g, '').slice(0, ID_LEN)}`;
export const carPath = (car) => `/auto/${carSlug(car)}`;
export const findCarBySlug = (rows, slug) => (rows || []).find((r) => r.id && carSlug(r) === slug) || null;

const fmt = (n) => new Intl.NumberFormat('cs-CZ').format(Math.round(Number(n) || 0));
export const carImages = (r) => (Array.isArray(r.images) && r.images.length ? r.images : r.image_url ? [r.image_url] : []).filter(Boolean);
const absUrl = (u) => (!u ? null : /^https?:\/\//.test(u) ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`);

export const carName = (r) => [r.brand, r.model].map((x) => String(x || '').trim()).filter(Boolean).join(' ');

export function carMeta(r) {
  const name = carName(r);
  const sold = r.status === 'sold';
  const bits = [r.year, r.km != null ? `${fmt(r.km)} km` : null, r.engine, r.condition ? `stav ${r.condition}` : null].filter(Boolean).join(', ');
  return {
    title: sold
      ? `${name} (${r.year}) — prodaný flip | FlipujKáru`
      : `${name} (${r.year}) za ${fmt(r.price)} Kč | Bazar FlipujKáru`,
    description: sold
      ? `${name} ${r.year} — auto, které jsme koupili, opravili a prodali. ${r.story ? String(r.story).slice(0, 110) : 'Podívej se na čísla a příběh flipu.'}`
      : `${name}, ${bits}. Prověřené auto s kontrolou VIN a kompletními papíry. Cena ${fmt(r.price)} Kč.`,
    image: absUrl(carImages(r)[0]) || OG_IMAGE,
  };
}

/** JSON-LD Car + Offer pro detail auta. */
export function carLd(r) {
  const url = `${SITE_URL}${carPath(r)}`;
  const images = carImages(r).map(absUrl).filter(Boolean).slice(0, 10);
  const sold = r.status === 'sold';
  const price = sold ? (r.sell_price || r.price) : r.price;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: carName(r),
    brand: { '@type': 'Brand', name: String(r.brand || '').trim() },
    model: String(r.model || '').trim(),
    url,
    ...(images.length ? { image: images } : {}),
    ...(r.year ? { vehicleModelDate: String(r.year), productionDate: String(r.year) } : {}),
    ...(r.km != null ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: Number(r.km), unitCode: 'KMT' } } : {}),
    ...(r.engine ? { vehicleEngine: { '@type': 'EngineSpecification', name: r.engine } } : {}),
    itemCondition: 'https://schema.org/UsedCondition',
  };
  if (price) {
    ld.offers = {
      '@type': 'Offer',
      url,
      price: Number(price),
      priceCurrency: 'CZK',
      availability: sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@id': `${SITE_URL}/#organization` },
    };
  }
  return ld;
}

/* ---------- Firma ---------- */

export const ORG = {
  name: 'FlipujKáru',
  legalName: 'Nutriverse s.r.o.',
  ico: '13965433',
  vatID: 'CZ13965433',
  street: 'Světova 523/1',
  postalCode: '180 00',
  city: 'Praha 8',
  phone: '+420 605 977 665',
  email: 'predplatne@flipujkaru.cz',
  sameAs: [], // odkazy na sociální sítě — doplnit, až budou (Instagram, YouTube, Facebook, TikTok)
};

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'AutoDealer'],
    '@id': `${SITE_URL}/#organization`,
    name: ORG.name,
    legalName: ORG.legalName,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/icon-512.png`,
    image: OG_IMAGE,
    email: ORG.email,
    telephone: ORG.phone,
    vatID: ORG.vatID,
    identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: ORG.ico },
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORG.street,
      postalCode: ORG.postalCode,
      addressLocality: ORG.city,
      addressCountry: 'CZ',
    },
    ...(ORG.sameAs.length ? { sameAs: ORG.sameAs } : {}),
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: 'cs',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function faqLd(items) {
  const list = (items || []).filter((i) => i.q && i.a);
  if (!list.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: list.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}

export function sellServiceLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Prodej auta za majitele',
    serviceType: 'Zprostředkování prodeje ojetého auta',
    description: PAGES['/prodej-auta'].description,
    url: `${SITE_URL}/prodej-auta`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Česká republika' },
    offers: { '@type': 'Offer', description: 'Nacenění auta zdarma a nezávazně. Provizi platí kupec v ceně auta.', price: 0, priceCurrency: 'CZK' },
  };
}

export function courseLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Car-flipping akademie FlipujKáru',
    description: PAGES['/akademie'].description,
    url: `${SITE_URL}/akademie`,
    inLanguage: 'cs',
    provider: { '@id': `${SITE_URL}/#organization` },
    offers: { '@type': 'Offer', category: 'Subscription', url: `${SITE_URL}/cenik`, priceCurrency: 'CZK', availability: 'https://schema.org/InStock' },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
  };
}

/** plans: [{ label, price, period }] z billing.js */
export function membershipLd(plans) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Členství v akademii FlipujKáru',
    description: PAGES['/cenik'].description,
    url: `${SITE_URL}/cenik`,
    image: OG_IMAGE,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: plans.map((p) => ({
      '@type': 'Offer',
      name: p.label,
      price: p.price,
      priceCurrency: 'CZK',
      url: `${SITE_URL}/cenik`,
      availability: 'https://schema.org/InStock',
    })),
  };
}

/* ---------- Head ---------- */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const jsonScript = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

/** Kompletní obsah <head> specifický pro stránku (title, popis, canonical, OG, Twitter, JSON-LD). */
export function headTags({ title, description, path, image = OG_IMAGE, type = 'website', noindex = false, ld = [] }) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    '<meta property="og:locale" content="cs_CZ" />',
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    ...(image === OG_IMAGE ? ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />'] : []),
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    ...ld.filter(Boolean).map(jsonScript),
  ].join('\n    ');
}

export { esc as escapeHtml };
