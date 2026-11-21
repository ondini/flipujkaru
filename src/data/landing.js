/* ============================================================
   Obsah nové úvodní stránky (podle „FlipujKáru — landing page.pdf").
   Nadpisy a odstavce jdou upravit v administraci (Texty webu → Úvodní
   stránka, klíče home_*); výchozí znění je tady v HOME_TEXT.
============================================================ */

/** Výchozí texty úvodní stránky (klíč = klíč v tabulce `content`). */
export const HOME_TEXT = {
  // Hero
  home_hero_badge: 'Prověřená auta a reálné know-how',
  home_hero_title: 'Kupuj chytře.',
  home_hero_title_accent: 'Prodávej se ziskem',
  home_hero_subtitle:
    'Nekupuješ kurz. Kupuješ know-how, přístup ke kontaktům a vlastní scraper, jehož provoz nás reálně stojí peníze. S námi se naučíš kupovat a prodávat auta se ziskem, získáš nové kontakty, zvýhodněné ceny na servis kolem aut i možnost přivýdělku ze zprostředkování.',
  home_hero_savings: 'Peníze na spořicím účtu jen pomalu ztrácí hodnotu — auto pod cenou ti za pár týdnů vydělá víc než banka za rok.',
  home_stat_sold: '320',
  home_stat_members: '1800',

  // Co u nás dostaneš
  home_gets_title: 'Co u nás dostaneš',
  home_gets_text:
    'Flipování aut s výnosem. Zhodnocení úspor, které jinak jen ztrácí hodnotu na účtu. Know-how, jak prodat auto sám a nechat si celou marži — místo abys 5–7 % nechal bazaru. Komunitu flipperů z celé ČR a SK se sítí na servis, detailing, náhradní díly, pojištění, financování, přepravu i účetního. Scanner, který hlídá trh za tebe, i individuální scanner na míru tvým filtrům. Cashback za pojištění a provize za financování, která může pokrýt roky členství dopředu.',
  home_gets_accent: 'A tohle všechno se naučíš s námi.',

  // Co se v komunitě naučíš
  home_learn_title: 'Co se v komunitě naučíš',
  home_learn_subtitle:
    'Flipování bytů nemůže dělat každý — chce to statisíce stranou. Flipování aut zvládne skoro každý, kdo chce makat. Tohle je přesně to know-how, které tě naučíme krok za krokem.',

  // Proč zrovna naše skupina
  home_group_badge: 'Unikátní model — v ČR a SK bez obdoby',
  home_group_title: 'Proč zrovna naše skupina',

  // Členství komunity
  home_member_eyebrow: 'Členství komunity',
  home_member_title: 'Za cenu Netflixu dostaneš partu, která ti',
  home_member_title_accent: 'vydělává',
  home_member_subtitle: '333 Kč měsíčně (3 999 Kč ročně). Na rozdíl od streamovací služby, ze které nikdy nic nemáš, ti tahle platforma peníze vrací.',
  home_member_netflix_price: '330 Kč',
  home_member_netflix_label: 'Netflix Premium',
  home_member_netflix_text: 'Večer u seriálu. A nic navíc.',
  home_member_our_price: '333 Kč',
  home_member_our_label: 'FlipujKáru',
  home_member_our_text: 'Know-how, kontakty, scraper a šance vydělat tisíce.',
  home_member_compare_note: 'Za stejné peníze si vybíráš mezi jedním večerem u seriálu a příležitostí, která se ti může vrátit mnohonásobně.',
  home_member_referral_title: 'Provize za doporučení = 4–6 let členství',
  home_member_referral_text:
    'Stačí doporučit klienta na úvěr nebo leasing — nemusíš sám prodat ani jedno auto. Provize může pokrýt roky členství dopředu. Záleží na bance a výši provize, i tak jde o nejsilnější jednorázový výdělek v komunitě.',
  home_member_cta: 'Staň se členem — 333 Kč/měsíc',
  home_member_cta_note: 'Fakturováno ročně jako 3 999 Kč',

  // Tohle jsme sami naflipovali
  home_flips_title: 'Tohle jsme sami naflipovali',
  home_flips_subtitle: 'Žádná teorie — tyhle vozy prošly našima rukama. A klidně si je rovnou koupíš.',

  // Kontakt
  home_contact_title: 'Nezmeškej nové kusy a tipy',
  home_contact_text: 'Jednou týdně to nejlepší z bazaru a flipping světa. Žádný spam.',
};

/** Text z administrace, jinak výchozí. */
export const homeText = (t, key) => (t?.[key] || '').trim() || HOME_TEXT[key];

/** „Co se v komunitě naučíš" — 12 karet. */
export const LEARN_ITEMS = [
  { title: 'Kde hledat auta pod cenou', text: 'Scanner napříč Evropou i ruční tipy, kde nikdo jiný nehledá.' },
  { title: 'Jak auto ověřit', text: 'Dekra, Cebia, Carvertical, servisní historie — než dáš peníze z ruky.' },
  { title: 'Jak vyjednat nákup', text: 'Cena, stav, rizika — abys nekoupil cizí problém.' },
  { title: 'Dovoz a byrokracie', text: 'Registrace, STK, evidence — nic co by tě zaskočilo.' },
  { title: 'Příprava na prodej', text: 'Detailing, fotky, inzerce na nejlepších portálech.' },
  { title: 'Prodej bez komise bazaru', text: '99 % bazarů si vezme 5–7 %. Ty si necháš celou marži.' },
  { title: 'Právo a daně', text: 'Smlouvy a DPH tak, abys neudělal drahou chybu.' },
  { title: 'Financování a pojištění', text: 'Jak z nich udělat další zdroj výdělku, ne jen nutnost.' },
  { title: 'Jak nastavit fér prodejní cenu', text: 'Podle reálných dat z trhu, ne podle odhadu nazdařbůh.' },
  { title: 'Jak zvládnout první flip bez chyby', text: 'Kompletní postup krok za krokem, ne pokus omyl na vlastní triko.' },
  { title: 'Jak z toho udělat byznys', text: 'Ne jednorázovku, ale opakovatelný systém, co jede dál.' },
  { title: 'Jak růst rychleji s komunitou', text: 'Sdílené dealy a kontakty místo učení se jen na vlastních chybách.' },
];

/** „Proč zrovna naše skupina" — 4 karty (nad live feedem). */
export const GROUP_REASONS = [
  { icon: 'BadgeCheck', title: 'Nejsme kurz z internetu', text: 'Sami flipujeme — 320+ prodaných aut. Know-how, co tě učíme, jsme si sami vyzkoušeli a draze zaplatili za chyby.' },
  { icon: 'Layers', title: 'Žádná jiná skupina to nemá takhle dohromady', text: 'Scanner, individuální filtry, komunita a finanční provize pod jednou střechou — ne pět různých skupin a kurzů.' },
  { icon: 'Users', title: '1 800+ lidí, co si pomáhají', text: 'Nejsi v tom sám — komunita sdílí dealy, kontakty a chyby, ze kterých se učí všichni rychleji.' },
  { icon: 'Coins', title: 'Vyděláváš i mimo samotné flipování', text: 'Cashback, provize za financování, market v komunitě — příjem neskončí u jednoho prodaného auta.' },
];

/** Členství komunity — 4 výhody pod boxem s provizí. */
export const MEMBER_PERKS = [
  { icon: 'ShieldCheck', title: 'Jako jediní v ČR a SK', text: 'Dáváme provizi, i když jen doporučíš pojistku nebo úvěr — nemusíš prodat auto.' },
  { icon: 'Car', title: 'Market aut v komunitě', text: 'Kupuješ a prodáváš se ziskem přímo mezi členy.' },
  { icon: 'Radar', title: 'Scanner napříč Evropou', text: 'Hlídá nabídky v ČR, Německu, Rakousku a Itálii.' },
  { icon: 'BellRing', title: 'Individuální scanner', text: 'Vlastní filtry — notifikace rovnou na Telegram.' },
];
