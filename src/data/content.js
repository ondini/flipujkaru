/* ============================================================
   Centrální obsah webu — vše na jednom místě.
   Přidání auta / plánu / FAQ = jeden záznam do pole.
============================================================ */

/** Auta na prodej. category: 'sportovni' | 'denni' | 'investicni'
 *  engine = motorizace, condition = stav (A+/A/B+), vat = odpočet DPH */
export const CARS = [
  { brand: 'BMW', model: 'M2 Competition', year: 2021, km: 38500, price: 1190000, category: 'sportovni', engine: '3.0 R6 • 410 koní', condition: 'A+', vat: true, badge: { text: 'TOP STAV', tone: 'accent' }, img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Audi', model: 'A4 Avant 2.0 TDI', year: 2019, km: 96200, price: 489000, category: 'denni', engine: '2.0 TDI • 190 koní', condition: 'A', vat: true, badge: { text: 'NOVINKA', tone: 'new' }, img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Porsche', model: '911 Carrera (991)', year: 2016, km: 61000, price: 2390000, category: 'investicni', engine: '3.0 Boxer • 370 koní', condition: 'A+', vat: false, badge: { text: 'INVESTICE', tone: 'accent' }, img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Škoda', model: 'Octavia RS', year: 2020, km: 72400, price: 639000, category: 'denni', engine: '2.0 TSI • 245 koní', condition: 'A', vat: true, badge: null, img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Mercedes-AMG', model: 'C 63 S', year: 2018, km: 54300, price: 1490000, category: 'sportovni', engine: '4.0 V8 BiTurbo • 510 koní', condition: 'A+', vat: true, badge: { text: 'PRODÁNO', tone: 'sold' }, img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Volkswagen', model: 'Golf 7 GTI', year: 2017, km: 110800, price: 429000, category: 'denni', engine: '2.0 TSI • 230 koní', condition: 'B+', vat: false, badge: { text: 'TOP STAV', tone: 'accent' }, img: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Nissan', model: 'GT-R R35', year: 2015, km: 47900, price: 1990000, category: 'investicni', engine: '3.8 V6 BiTurbo • 550 koní', condition: 'A', vat: false, badge: { text: 'NOVINKA', tone: 'new' }, img: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Toyota', model: 'Supra A90', year: 2020, km: 29500, price: 1290000, category: 'investicni', engine: '3.0 R6 • 340 koní', condition: 'A+', vat: true, badge: { text: 'INVESTICE', tone: 'accent' }, img: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=800&q=70' },
  { brand: 'Ford', model: 'Mustang GT 5.0', year: 2019, km: 41200, price: 999000, category: 'sportovni', engine: '5.0 V8 • 450 koní', condition: 'A', vat: true, badge: null, img: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=70' },
];

/** Ukázky úspěšných flipů — buy → invested (po opravě) → sell → profit.
 *  weeks = délka flipu. found/location/problems/work/summary = detail do modalu. */
export const FLIPS = [
  {
    brand: 'BMW', model: '330i (F30)', year: 2018, buy: 385000, repair: 42000, sell: 529000, weeks: 4,
    img: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=800&q=70',
    location: 'Mnichov, Německo',
    found: 'Náš algoritmus zachytil inzerát 4 minuty po vyvěšení — 18 % pod tržní cenou. Volali jsme jako první.',
    problems: ['Kosmetické škrábance na předním nárazníku', 'Zanedbaný interiér po kuřákovi', 'Blížící se velký servis'],
    work: ['Lokální lak nárazníku', 'Hloubkový detailing + ozonizace', 'Velký servis vč. rozvodů', 'Sada nových letních pneu'],
    summary: 'Auto bylo technicky zdravé, jen opticky unavené a od kuřáka — proto se prodávalo levně a dlouho leželo. Stačilo ho dát do pucu, doložit servisní historii a nafotit profesionálně. Prodáno za 9 dní prvnímu zájemci.',
  },
  {
    brand: 'Audi', model: 'A6 3.0 TDI', year: 2017, buy: 540000, repair: 68000, sell: 715000, weeks: 6,
    img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=70',
    location: 'Vídeň, Rakousko',
    found: 'Vůz po jednom majiteli s plnou historií. Algoritmus ho označil díky výbavě hluboko pod cenou srovnatelných kusů.',
    problems: ['Opotřebené brzdy do/zad', 'Vůle v náprave', 'Chybějící letní sada'],
    work: ['Kompletní brzdy', 'Renovace přední nápravy', 'Letní alu kola', 'Detailing + leštění laku'],
    summary: 'Top výbava (vzduch, matrix, kůže) za cenu základu. Investice šla hlavně do podvozku a brzd, aby auto jezdilo jako nové. Dovoz, přepis i STK jsme vyřešili kompletně — kupující si jen převzal klíče.',
  },
  {
    brand: 'Škoda', model: 'Superb 2.0 TSI', year: 2019, buy: 410000, repair: 31000, sell: 519000, weeks: 3,
    img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=70',
    location: 'Praha, Česko',
    found: 'Domácí kus z autobazaru, který nedokázal auto prodat. Naše data ukázala silnou poptávku po této verzi.',
    problems: ['Špatně nafocený inzerát', 'Drobné odřeniny disků', 'Nevyčištěný interiér'],
    work: ['Repase 4 disků', 'Kompletní detailing', 'Profi focení + nový inzerát'],
    summary: 'Klasický příklad, kdy stačí marketing. Auto bylo v pořádku, jen se prezentovalo amatérsky. Minimální investice, maximální efekt — nejrychlejší flip, prodáno za 6 dní.',
  },
  {
    brand: 'Volkswagen', model: 'Passat B8', year: 2018, buy: 320000, repair: 38000, sell: 445000, weeks: 5,
    img: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&w=800&q=70',
    location: 'Lipsko, Německo',
    found: 'Algoritmus hlídal konkrétní motorizaci 2.0 TDI DSG. Naskočila notifikace na vůz po leasingu s nízkým nájezdem.',
    problems: ['Drobné kameny na čele kapoty', 'Opotřebená spojka DSG', 'Prošlá STK'],
    work: ['Servis převodovky DSG', 'Lak přední kapoty', 'Nová STK + emise', 'Detailing'],
    summary: 'Firemní auto po leasingu bývá perfektní základ — pravidelný servis, jeden řidič. Po servisu DSG a kosmetice z něj byl prakticky nový rodinný kombík za poloviční cenu nového.',
  },
  {
    brand: 'Mercedes', model: 'C220d (W205)', year: 2017, buy: 465000, repair: 55000, sell: 629000, weeks: 7,
    img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=70',
    location: 'Stuttgart, Německo',
    found: 'Vůz s lehce poškozeným nárazníkem, který odrazoval kupce. Pro nás signál k dobré ceně.',
    problems: ['Prasklý zadní nárazník', 'Opotřebený interiér řidiče', 'Staré pneu'],
    work: ['Výměna a lak zadního nárazníku', 'Renovace kožených sedaček', 'Nové celoroční pneu', 'Detailing motoru'],
    summary: 'Lidé se bojí aut „po nehodě", i když jde o kosmetiku za pár tisíc. Opravený nárazník, oživený interiér a auto rázem působilo prémiově. Prodáno do regionu za poptávanou cenu.',
  },
  {
    brand: 'Ford', model: 'Focus ST', year: 2019, buy: 295000, repair: 27000, sell: 389000, weeks: 3,
    img: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=70',
    location: 'Brno, Česko',
    found: 'Horký hatchback s velkou fanouškovskou základnou. Algoritmus hlídá modely, které se vždy rychle prodají.',
    problems: ['Sjeté přední pneu', 'Drobné odřeniny prahů', 'Nečitelná serviska'],
    work: ['Nové sportovní pneu', 'Lak prahů', 'Dohledání a doplnění historie'],
    summary: 'Sportovní modely jako Focus ST mají vždy kupce — jde jen o cenu a stav. Rychlá kosmetika, doložená historie a auto zmizelo za 5 dní s pěknou marží.',
  },
];

/** Režimy zobrazení bazaru */
export const MARKET_VIEWS = [
  { key: 'sale', label: 'Naše auta na prodej', icon: 'Car' },
  { key: 'flips', label: 'Ukázky úspěšných flipů', icon: 'TrendingUp' },
];

/** Filtry bazaru */
export const FILTERS = [
  { key: 'vse', label: 'Vše' },
  { key: 'sportovni', label: 'Sportovní' },
  { key: 'denni', label: 'Denní ježdění' },
  { key: 'investicni', label: 'Investiční' },
];

/** Štítek kategorie pro kartu */
export const CATEGORY_LABEL = { sportovni: 'Sportovní', investicni: 'Investiční', denni: 'Denní' };

/** Výhody akademie (icon = název Lucide ikony) */
export const BENEFITS = [
  { icon: 'Database', title: 'Rozhodnutí podle dat', text: 'Reálné prodejní ceny, poptávka a historie modelů. Víš dopředu, co koupit a za kolik to prodáš.' },
  { icon: 'Users', title: 'Komunita, co táhne', text: 'Uzavřený Discord, kde se denně sdílí dealy, kontakty i chyby. V tom nejsi nikdy sám.' },
  { icon: 'Compass', title: 'Vedení krok za krokem', text: 'Od prvního inzerátu až po prodej. Provedeme tě celým flipem, abys neudělal drahou chybu.' },
  { icon: 'ShieldCheck', title: 'Právně bez starostí', text: 'Smlouvy, daně, DPH i reklamace. Flipuj s jistotou, ne s obavami z papírů.' },
];

/** Recenze studentů pro nekonečný slider (marquee).
 *  Bez fotek — jen barevný odznak s iniciálami (ReviewCard v StudentReviews.jsx).
 *  stars = počet hvězd */
export const REVIEWS = [
  { name: 'Petr S.', role: 'Akademie 3 týdny', initials: 'PS', stars: 5, text: 'První flip mi vydělal 35 000 Kč už po 3 týdnech v akademii. Nečekal jsem to tak rychle.', stat: '+35 000 Kč' },
  { name: 'Martin K.', role: 'Člen 8 měsíců', initials: 'MK', stars: 5, text: 'Kalkulačka a komunita mi ušetřily desítky chyb. Druhý flip čistého 62 000 Kč.', stat: '+62 000 Kč' },
  { name: 'Tereza V.', role: 'Členka 1 rok', initials: 'TV', stars: 5, text: 'Z koníčku se stal vedlejší příjem. Za rok 9 aut, průměrná marže 18 %.', stat: '9 flipů / rok' },
  { name: 'David P.', role: 'Člen 10 měsíců', initials: 'DP', stars: 5, text: '1:1 servis se mi vrátil hned u druhého auta. Analýza inzerátu od týmu = jiná liga.', stat: 'ROI 240 %' },
  { name: 'Jana M.', role: 'Akademie 5 měsíců', initials: 'JM', stars: 5, text: 'Bála jsem se, že autům nerozumím. Systém mě provedl krok za krokem k prvnímu zisku.', stat: '+28 000 Kč' },
  { name: 'Lukáš R.', role: 'Člen 1 rok', initials: 'LR', stars: 5, text: 'Insider tipy na auta jsou zlato. Koupil jsem pod cenou a prodal za týden.', stat: '+41 000 Kč' },
  { name: 'Ondřej B.', role: 'Člen 6 měsíců', initials: 'OB', stars: 5, text: 'Discord komunita je nabitá. Když nevím, do hodiny mám odpověď od profíků.', stat: '4 flipy' },
  { name: 'Klára N.', role: 'Členka 9 měsíců', initials: 'KN', stars: 5, text: 'Individuální podpora mi pomohla vyladit prodejní inzeráty. Auta teď mizí dvakrát rychleji.', stat: 'ROI 190 %' },
  { name: 'Filip H.', role: 'Akademie 2 měsíce', initials: 'FH', stars: 5, text: 'Nikdy jsem netušil, kolik chyb dělám při focení a popisu inzerátu. Po úpravě podle checklistu se auto prodalo za 4 dny.', stat: '+19 000 Kč' },
  { name: 'Michaela D.', role: 'Členka 4 měsíce', initials: 'MD', stars: 5, text: 'Jako žena jsem se bazaru trochu bála. Komunita mě podržela od prvního telefonátu s prodejcem.', stat: '+33 000 Kč' },
  { name: 'Tomáš K.', role: 'Člen 1 rok', initials: 'TK', stars: 5, text: 'Hlídací pes mi našel Octavii 40 tisíc pod cenou. Do týdne pryč se ziskem.', stat: '+40 000 Kč' },
  { name: 'Barbora Š.', role: 'Akademie 6 týdnů', initials: 'BŠ', stars: 5, text: 'Kalkulačka ROI mě zachránila před koupí auta, které by se prodávalo se ztrátou.', stat: 'Ušetřeno 25 000 Kč' },
  { name: 'Jakub V.', role: 'Člen 8 měsíců', initials: 'JV', stars: 5, text: 'Materiály o dovozu ze zahraničí jsou k nezaplacení. Auto z Německa jsem přivezl bez jediné chyby v papírech.', stat: '+58 000 Kč' },
  { name: 'Eliška P.', role: 'Členka 1 rok', initials: 'EP', stars: 5, text: 'Za rok se ze mě stala pravidelná flipperka. Šest aut, žádné se ztrátou.', stat: '6 flipů / rok' },
  { name: 'Marek Z.', role: 'Akademie 3 měsíce', initials: 'MZ', stars: 5, text: 'Síť prověřených mechaniků mi ušetřila desítky hodin hledání a spoustu peněz za předražené opravy.', stat: '+22 000 Kč' },
  { name: 'Simona R.', role: 'Členka 5 měsíců', initials: 'SR', stars: 5, text: 'Nejvíc mi dala právní stránka — smlouvy a DPH už řeším s klidem, ne s obavami.', stat: '+31 000 Kč' },
  { name: 'Adam N.', role: 'Člen 2 roky', initials: 'AN', stars: 5, text: 'Flipuju při zaměstnání jako vedlejšák. Za dva roky přes 15 aut a stabilní přivýdělek.', stat: '15 flipů' },
  { name: 'Veronika L.', role: 'Akademie 2 měsíce', initials: 'VL', stars: 5, text: 'Nejlepší investice do sebe, co jsem letos udělala. Kurz dává smysl krok za krokem.', stat: '+26 000 Kč' },
  { name: 'Patrik M.', role: 'Člen 7 měsíců', initials: 'PM', stars: 5, text: 'Live feed algoritmu je návykový. Zavolal jsem na inzerát 6 minut po zveřejnění a byl jsem první.', stat: '+47 000 Kč' },
  { name: 'Nikola B.', role: 'Členka 3 měsíce', initials: 'NB', stars: 5, text: 'Bez technického vzdělání jsem se bála koupit auto s vadou. Checklist prohlídky mi dal jistotu.', stat: '+21 000 Kč' },
  { name: 'Vojtěch S.', role: 'Člen 1 rok', initials: 'VS', stars: 5, text: 'Prodejní inzeráty podle šablony z akademie prodávají o dost rychleji než ty moje původní.', stat: '+36 000 Kč' },
  { name: 'Kateřina H.', role: 'Akademie 4 měsíce', initials: 'KH', stars: 5, text: 'Q&A s týmem jednou měsíčně je super — konkrétní odpovědi na konkrétní auto, ne obecné rady.', stat: '+24 000 Kč' },
  { name: 'Radek F.', role: 'Člen 9 měsíců', initials: 'RF', stars: 5, text: 'Vyjednávání jsem se naučil z materiálů a ušetřil při nákupu skoro 30 tisíc.', stat: 'Ušetřeno 30 000 Kč' },
  { name: 'Lenka J.', role: 'Členka 1 rok', initials: 'LJ', stars: 5, text: 'Auta beru jako druhé zaměstnání. Systém a data z akademie z toho udělaly předvídatelný byznys.', stat: '8 flipů / rok' },
  { name: 'Štěpán D.', role: 'Akademie 5 týdnů', initials: 'ŠD', stars: 5, text: 'Nikdy jsem neopravoval auto, teď vím přesně, komu zavolat a kolik má oprava reálně stát.', stat: '+18 000 Kč' },
  { name: 'Zuzana K.', role: 'Členka 6 měsíců', initials: 'ZK', stars: 5, text: 'Komunita mi doporučila kupce dřív, než jsem stihla dát inzerát ven.', stat: '+45 000 Kč' },
  { name: 'Daniel R.', role: 'Člen 2 roky', initials: 'DR', stars: 5, text: 'Za dva roky se z koníčku stal vážný přivýdělek vedle práce. Bez akademie bych dodnes tápal.', stat: '12 flipů' },
  { name: 'Petra V.', role: 'Akademie 3 měsíce', initials: 'PV', stars: 5, text: 'Konečně rozumím, proč se jedno auto prodává hned a druhé měsíc leží. Data z platformy nelžou.', stat: '+27 000 Kč' },
  { name: 'Matěj O.', role: 'Člen 4 měsíce', initials: 'MO', stars: 5, text: 'Support odpovídá fakt rychle, i o víkendu. Poradili mi s reklamací během hodiny.', stat: '+20 000 Kč' },
  { name: 'Anna Č.', role: 'Členka 8 měsíců', initials: 'AČ', stars: 5, text: 'Přechod od jednoho flipu za rok k pravidelnému příjmu byl rychlejší, než jsem čekala.', stat: '+52 000 Kč' },
];

/** Cenový plán — jediné členství, jedna cena, ročně.
 *  1:1 schůzky se zakladateli a kompletní asistence s dovozem auta (health
 *  check, opravy, přepis do ČR) jsou samostatná placená služba nad rámec
 *  členství — viz sekce „Osobní servis pro členy" (WhyUs.jsx). */
export const PLANS = [
  { name: 'AKADEMIE', price: 14999, period: 'rok', tagline: 'Vše, co potřebuješ k prvnímu i desátému flipu', featured: true, cta: 'Chci se stát členem',
    features: [
      'Kompletní know-how car flippingu od A do Z',
      'Vlastní algoritmus — notifikace o autech pod cenou napříč Evropou',
      'Kalkulačka zisku, marže a ROI',
      'Přístup do uzavřené Discord komunity',
      'Knihovna smluv, šablon a daňových postupů',
      'Měsíční živé Q&A s týmem',
      '2měsíční garance — nestihneš flip, vrátíme peníze',
    ] },
];

/** Časté dotazy */
export const FAQ = [
  { q: 'Je car flipping legální? Nepohybuju se v šedé zóně?', a: 'Je to standardní podnikání — nákup a prodej movité věci. Vše vedeme transparentně a podle legislativy: ke každému vozu kupní smlouva, faktura, řádně řešené DPH a přepis. V akademii tě provedeme i daňovou stránkou, abys měl od první koruny papíry v pořádku.' },
  { q: 'Jaké je reálné riziko, že prodělám?', a: 'Riziko nikdy není nulové — a kdo tvrdí opak, lže. Naším úkolem je ho systematicky minimalizovat: pracujeme s reálnými tržními daty, počítáme zisk i rezervu předem v kalkulačce ROI a kupujeme jen vozy s prověřeným stavem a historií. Neprodáváme sny, ale postup, který drží riziko pod kontrolou.' },
  { q: 'Jak poznám, že auta z vašeho bazaru nejsou skryté vraky?', a: 'Každý vůz prochází technickou prohlídkou, ověřením původu a stavu km a kontrolou právního stavu (zástavy, leasing, odcizení). Ke každému autu dostaneš kompletní reporty — nic neskrýváme. Co nevíme jistě, do inzerátu nepíšeme.' },
  { q: 'Slibujete garantovaný výdělek?', a: 'Ne. Garantovaný výdělek neexistuje a takové sliby jsou varovný signál. Garantujeme nástroje, data a postupy, které dělají rozdíl mezi hádáním a informovaným rozhodnutím. Výsledek závisí na trhu a na tobě — my ti dáme maximální náskok.' },
  { q: 'Potřebuju velký kapitál nebo zkušenosti s auty?', a: 'Ne. Většina členů začíná s autem za 80–150 tisíc a bez technického vzdělání. Naučíme tě pracovat s tím, co máš, opřít se o síť prověřených mechaniků a růst postupně.' },
  { q: 'Jste jen další online kurz?', a: 'Nejsme. Stojíme na vlastním softwaru (algoritmus skenující inzeráty napříč Evropou, kalkulačky), fyzickém skladu prověřených aut a síti partnerů. Akademie je jen jedna část — ne celý byznys.' },
  { q: 'Co se děje s mými penězi a daty?', a: 'Platby zpracovává zabezpečená brána Stripe, karty u nás nikdy neukládáme. Osobní údaje chráníme dle GDPR. Žádné skryté poplatky — ceny jsou uvedené včetně DPH.' },
];

/** „Proč právě my?" — konkurenční výhody. highlight = vlajková loď (algoritmus) */
export const WHY_US = [
  {
    icon: 'Radar', highlight: true,
    title: 'Vlastní algoritmus skenuje celou Evropu',
    text: 'Náš software hlídá inzeráty v Německu, Rakousku, Itálii i ČR podle tvých parametrů. Sotva se objeví auto pod cenou, máme notifikaci — a voláme jako první, často pár minut po vyvěšení. Než ostatní stihnou scrollovat, my už jednáme.',
  },
  { icon: 'LineChart', title: 'Trh známe nazpaměť', text: 'Roky praxe a analýza tuzemského i zahraničního trhu. Víme, co se kdy prodá — značka, motorizace, sezóna. Nehádáme, počítáme.' },
  { icon: 'PiggyBank', title: 'Neplatíš provizi, vyděláváš ji', text: '99 % autosalonů chce tvé auto do komise a vezme si 5–7 % ze zisku. My tě naučíme auto prodat a vydělat na něj sám — marže zůstává celá tobě.' },
  { icon: 'GraduationCap', title: 'Vysvětlíme ti úplně vše', text: 'Provedeme tě problematikou od A do Z, včetně rizik a nástrah, kterým se vyhnout. Hrajeme s otevřenými kartami.' },
  { icon: 'Gift', title: 'Workshopy, akce a dárky', text: 'Pravidelné workshopy, členské výhody i setkání naživo. Komunita, která drží spolu — online i offline.' },
  { icon: 'Wrench', title: 'Síť prověřených parťáků', text: 'Mechanici, lakovny a dovozci po celé Evropě. Práce za férové ceny a v termínu — ověřeno na desítkách aut.' },
  { icon: 'Scale', title: 'Právní a daňové zázemí', text: 'Dovoz, přepis, DPH i smlouvy. Provedeme tě papírováním tak, abys nešlápl vedle.' },
  { icon: 'HeartHandshake', title: 'Komunita, ne konkurence', text: 'Členové si radí, sdílí kontakty i dealy. Rosteme spolu, ne proti sobě.' },
];

/** Živý feed notifikací algoritmu (animovaná ukázka).
 *  ~200 kusů z reálného rozpětí českého bazarového trhu (200–650 tis. Kč) —
 *  Škodovky, běžné dovozy a levné elektromobily. WhyUs.jsx si pořadí zamíchá
 *  pro každou návštěvu, ať se feed nikdy nezacyklí uživateli před očima. */
export const ALGO_FEED = [
  { car: 'Škoda Fabia 1.0 TSI', loc: 'Přerov, CZ', price: 638000, tag: '−9 % pod trhem' },
  { car: 'Škoda Fabia 1.2 TSI', loc: 'Norimberk, DE', price: 541000, tag: '−22 % pod trhem' },
  { car: 'Škoda Rapid 1.6 TDI', loc: 'Nitra, SK', price: 462000, tag: '−9 % pod trhem' },
  { car: 'Škoda Octavia 1.6 TDI', loc: 'Košice, SK', price: 244000, tag: '−11 % pod trhem' },
  { car: 'Škoda Octavia 1.4 TSI', loc: 'Znojmo, CZ', price: 233000, tag: '−22 % pod trhem' },
  { car: 'Škoda Octavia Combi 2.0 TDI', loc: 'Norimberk, DE', price: 211000, tag: '−8 % pod trhem' },
  { car: 'Škoda Superb 1.8 TSI', loc: 'Bratislava, SK', price: 404000, tag: '−16 % pod trhem' },
  { car: 'Škoda Yeti 1.2 TSI', loc: 'Kladno, CZ', price: 558000, tag: '−10 % pod trhem' },
  { car: 'Škoda Karoq 1.0 TSI', loc: 'Kladno, CZ', price: 463000, tag: '−20 % pod trhem' },
  { car: 'Škoda Kamiq 1.0 TSI', loc: 'Brno, CZ', price: 498000, tag: '−18 % pod trhem' },
  { car: 'Škoda Scala 1.0 TSI', loc: 'Frýdek-Místek, CZ', price: 320000, tag: '−8 % pod trhem' },
  { car: 'Škoda Citigo 1.0 MPI', loc: 'Žilina, SK', price: 278000, tag: '−10 % pod trhem' },
  { car: 'Škoda Roomster 1.6 TDI', loc: 'Frýdek-Místek, CZ', price: 509000, tag: '−24 % pod trhem' },
  { car: 'Volkswagen Golf 6 1.6 TDI', loc: 'Plzeň, CZ', price: 548000, tag: '−20 % pod trhem' },
  { car: 'Volkswagen Golf 7 1.2 TSI', loc: 'České Budějovice, CZ', price: 209000, tag: '−6 % pod trhem' },
  { car: 'Volkswagen Polo 1.2 TSI', loc: 'Nitra, SK', price: 529000, tag: '−14 % pod trhem' },
  { car: 'Volkswagen Passat B7 2.0 TDI', loc: 'Ústí nad Labem, CZ', price: 313000, tag: '−11 % pod trhem' },
  { car: 'Volkswagen Touran 1.6 TDI', loc: 'Hradec Králové, CZ', price: 313000, tag: '−8 % pod trhem' },
  { car: 'Volkswagen up! 1.0 MPI', loc: 'Ústí nad Labem, CZ', price: 420000, tag: '−18 % pod trhem' },
  { car: 'Volkswagen Jetta 1.6 TDI', loc: 'Přerov, CZ', price: 371000, tag: '−22 % pod trhem' },
  { car: 'Volkswagen Caddy 2.0 TDI', loc: 'Žilina, SK', price: 287000, tag: '−16 % pod trhem' },
  { car: 'Hyundai i30 1.6 CRDi', loc: 'Hradec Králové, CZ', price: 329000, tag: '−15 % pod trhem' },
  { car: 'Hyundai i20 1.2', loc: 'Košice, SK', price: 525000, tag: '−8 % pod trhem' },
  { car: 'Hyundai ix20 1.4 CRDi', loc: 'Vídeň, AT', price: 446000, tag: '−10 % pod trhem' },
  { car: 'Hyundai Tucson 1.7 CRDi', loc: 'Hradec Králové, CZ', price: 442000, tag: '−9 % pod trhem' },
  { car: 'Hyundai Accent 1.4', loc: 'Ostrava, CZ', price: 291000, tag: '−20 % pod trhem' },
  { car: 'Kia Ceed 1.6 CRDi', loc: 'Nitra, SK', price: 251000, tag: '−8 % pod trhem' },
  { car: 'Kia Rio 1.2', loc: 'Hradec Králové, CZ', price: 490000, tag: '−23 % pod trhem' },
  { car: 'Kia Sportage 1.7 CRDi', loc: 'České Budějovice, CZ', price: 387000, tag: '−21 % pod trhem' },
  { car: 'Kia Venga 1.4 CVVT', loc: 'Norimberk, DE', price: 512000, tag: '−24 % pod trhem' },
  { car: 'Kia Picanto 1.0', loc: 'Nitra, SK', price: 353000, tag: '−9 % pod trhem' },
  { car: 'Renault Clio IV 1.2', loc: 'Ústí nad Labem, CZ', price: 478000, tag: '−22 % pod trhem' },
  { car: 'Renault Megane III 1.5 dCi', loc: 'Ostrava, CZ', price: 282000, tag: '−23 % pod trhem' },
  { car: 'Renault Captur 0.9 TCe', loc: 'Zlín, CZ', price: 316000, tag: '−11 % pod trhem' },
  { car: 'Renault Scenic III 1.5 dCi', loc: 'Nitra, SK', price: 549000, tag: '−18 % pod trhem' },
  { car: 'Dacia Sandero 1.0 TCe', loc: 'Opava, CZ', price: 568000, tag: '−9 % pod trhem' },
  { car: 'Dacia Duster 1.5 dCi', loc: 'Karlovy Vary, CZ', price: 458000, tag: '−15 % pod trhem' },
  { car: 'Dacia Logan 1.0 TCe', loc: 'Brno, CZ', price: 281000, tag: '−21 % pod trhem' },
  { car: 'Dacia Sandero Stepway 0.9 TCe', loc: 'Zlín, CZ', price: 476000, tag: '−6 % pod trhem' },
  { car: 'Dacia Spring Electric', loc: 'Ústí nad Labem, CZ', price: 632000, tag: '−8 % pod trhem' },
  { car: 'Peugeot 208 1.2 PureTech', loc: 'Liberec, CZ', price: 259000, tag: '−24 % pod trhem' },
  { car: 'Peugeot 308 1.6 HDi', loc: 'Plzeň, CZ', price: 468000, tag: '−23 % pod trhem' },
  { car: 'Peugeot 2008 1.2 PureTech', loc: 'Pardubice, CZ', price: 370000, tag: '−11 % pod trhem' },
  { car: 'Peugeot 3008 1.6 HDi', loc: 'Drážďany, DE', price: 635000, tag: '−21 % pod trhem' },
  { car: 'Citroën C3 1.2 PureTech', loc: 'Třebíč, CZ', price: 312000, tag: '−19 % pod trhem' },
  { car: 'Citroën C4 1.6 HDi', loc: 'Znojmo, CZ', price: 585000, tag: '−15 % pod trhem' },
  { car: 'Citroën Berlingo 1.6 HDi', loc: 'Košice, SK', price: 378000, tag: '−19 % pod trhem' },
  { car: 'Opel Astra J 1.6 CDTI', loc: 'Brno, CZ', price: 446000, tag: '−20 % pod trhem' },
  { car: 'Opel Corsa E 1.2', loc: 'Ústí nad Labem, CZ', price: 511000, tag: '−14 % pod trhem' },
  { car: 'Opel Insignia 2.0 CDTI', loc: 'Třebíč, CZ', price: 431000, tag: '−10 % pod trhem' },
  { car: 'Opel Mokka 1.6 CDTI', loc: 'Kladno, CZ', price: 292000, tag: '−6 % pod trhem' },
  { car: 'Opel Zafira 1.6 CDTI', loc: 'Košice, SK', price: 596000, tag: '−8 % pod trhem' },
  { car: 'Ford Fiesta 1.25', loc: 'Kladno, CZ', price: 308000, tag: '−9 % pod trhem' },
  { car: 'Ford Focus III 1.6 TDCi', loc: 'České Budějovice, CZ', price: 615000, tag: '−15 % pod trhem' },
  { car: 'Ford Mondeo IV 2.0 TDCi', loc: 'Vídeň, AT', price: 348000, tag: '−24 % pod trhem' },
  { car: 'Ford C-MAX 1.6 TDCi', loc: 'Vídeň, AT', price: 424000, tag: '−11 % pod trhem' },
  { car: 'Ford Kuga 2.0 TDCi', loc: 'Praha, CZ', price: 423000, tag: '−23 % pod trhem' },
  { car: 'Toyota Yaris 1.33', loc: 'Opava, CZ', price: 603000, tag: '−13 % pod trhem' },
  { car: 'Toyota Auris 1.4 D-4D', loc: 'Třebíč, CZ', price: 435000, tag: '−23 % pod trhem' },
  { car: 'Toyota Corolla 1.4 D-4D', loc: 'Bratislava, SK', price: 300000, tag: '−14 % pod trhem' },
  { car: 'Toyota RAV4 2.0 D-4D', loc: 'Kladno, CZ', price: 285000, tag: '−21 % pod trhem' },
  { car: 'Suzuki Swift 1.2', loc: 'Žilina, SK', price: 295000, tag: '−20 % pod trhem' },
  { car: 'Suzuki SX4 1.6', loc: 'Hradec Králové, CZ', price: 543000, tag: '−9 % pod trhem' },
  { car: 'Suzuki Vitara 1.6 DDiS', loc: 'Norimberk, DE', price: 238000, tag: '−17 % pod trhem' },
  { car: 'Honda Civic 1.6 i-DTEC', loc: 'Karlovy Vary, CZ', price: 262000, tag: '−16 % pod trhem' },
  { car: 'Honda CR-V 2.0 i-VTEC', loc: 'Pardubice, CZ', price: 226000, tag: '−10 % pod trhem' },
  { car: 'Honda Jazz 1.4', loc: 'Praha, CZ', price: 212000, tag: '−7 % pod trhem' },
  { car: 'Mazda 3 1.6 MZR-CD', loc: 'Liberec, CZ', price: 244000, tag: '−9 % pod trhem' },
  { car: 'Mazda CX-5 2.0 Skyactiv', loc: 'Praha, CZ', price: 461000, tag: '−24 % pod trhem' },
  { car: 'Mazda 2 1.3', loc: 'Znojmo, CZ', price: 500000, tag: '−9 % pod trhem' },
  { car: 'Nissan Qashqai 1.5 dCi', loc: 'Most, CZ', price: 438000, tag: '−11 % pod trhem' },
  { car: 'Nissan Micra 1.2', loc: 'Norimberk, DE', price: 405000, tag: '−17 % pod trhem' },
  { car: 'Nissan Note 1.5 dCi', loc: 'Liberec, CZ', price: 540000, tag: '−22 % pod trhem' },
  { car: 'Nissan Leaf Electric', loc: 'Norimberk, DE', price: 375000, tag: '−15 % pod trhem' },
  { car: 'BMW 116d E87', loc: 'Most, CZ', price: 556000, tag: '−6 % pod trhem' },
  { car: 'BMW 316d F30', loc: 'Opava, CZ', price: 464000, tag: '−10 % pod trhem' },
  { car: 'BMW 118i F20', loc: 'Frýdek-Místek, CZ', price: 361000, tag: '−9 % pod trhem' },
  { car: 'Audi A3 1.6 TDI', loc: 'České Budějovice, CZ', price: 377000, tag: '−9 % pod trhem' },
  { car: 'Audi A4 B8 2.0 TDI', loc: 'Nitra, SK', price: 506000, tag: '−14 % pod trhem' },
  { car: 'Mercedes-Benz A170 CDI', loc: 'České Budějovice, CZ', price: 608000, tag: '−14 % pod trhem' },
  { car: 'Mercedes-Benz B180 CDI', loc: 'Frýdek-Místek, CZ', price: 596000, tag: '−23 % pod trhem' },
  { car: 'Mercedes-Benz C200 CDI W204', loc: 'Třebíč, CZ', price: 593000, tag: '−17 % pod trhem' },
  { car: 'Fiat Panda 1.2', loc: 'Brno, CZ', price: 435000, tag: '−12 % pod trhem' },
  { car: 'Fiat Punto 1.3 Multijet', loc: 'Přerov, CZ', price: 228000, tag: '−8 % pod trhem' },
  { car: 'Fiat Tipo 1.6 Multijet', loc: 'České Budějovice, CZ', price: 645000, tag: '−7 % pod trhem' },
  { car: 'Fiat 500 1.2', loc: 'Vídeň, AT', price: 393000, tag: '−12 % pod trhem' },
  { car: 'Seat Ibiza 1.2 TSI', loc: 'Drážďany, DE', price: 379000, tag: '−9 % pod trhem' },
  { car: 'Seat Leon 1.6 TDI', loc: 'Ostrava, CZ', price: 438000, tag: '−9 % pod trhem' },
  { car: 'Seat Altea 1.6 TDI', loc: 'Ostrava, CZ', price: 443000, tag: '−18 % pod trhem' },
  { car: 'MG ZS EV Electric', loc: 'Třebíč, CZ', price: 439000, tag: '−16 % pod trhem' },
  { car: 'MG5 Electric', loc: 'Ostrava, CZ', price: 456000, tag: '−6 % pod trhem' },
  { car: 'BYD Dolphin Electric', loc: 'Nitra, SK', price: 266000, tag: '−8 % pod trhem' },
  { car: 'Renault Zoe Electric', loc: 'Brno, CZ', price: 295000, tag: '−21 % pod trhem' },
  { car: 'Volkswagen e-up! Electric', loc: 'Vídeň, AT', price: 419000, tag: '−15 % pod trhem' },
  { car: 'Smart ForFour Electric', loc: 'Most, CZ', price: 488000, tag: '−19 % pod trhem' },
  { car: 'Škoda Citigo-e iV Electric', loc: 'Nitra, SK', price: 466000, tag: '−24 % pod trhem' },
  { car: 'Škoda Fabia 1.0 TSI', loc: 'Košice, SK', price: 405000, tag: '−8 % pod trhem' },
  { car: 'Škoda Fabia 1.2 TSI', loc: 'Hradec Králové, CZ', price: 646000, tag: '−23 % pod trhem' },
  { car: 'Škoda Rapid 1.6 TDI', loc: 'Liberec, CZ', price: 476000, tag: '−19 % pod trhem' },
  { car: 'Škoda Octavia 1.6 TDI', loc: 'Jihlava, CZ', price: 305000, tag: '−14 % pod trhem' },
  { car: 'Škoda Octavia 1.4 TSI', loc: 'Zlín, CZ', price: 438000, tag: '−12 % pod trhem' },
  { car: 'Škoda Octavia Combi 2.0 TDI', loc: 'Brno, CZ', price: 632000, tag: '−13 % pod trhem' },
  { car: 'Škoda Superb 1.8 TSI', loc: 'Třebíč, CZ', price: 214000, tag: '−6 % pod trhem' },
  { car: 'Škoda Yeti 1.2 TSI', loc: 'Nitra, SK', price: 523000, tag: '−7 % pod trhem' },
  { car: 'Škoda Karoq 1.0 TSI', loc: 'Vídeň, AT', price: 232000, tag: '−12 % pod trhem' },
  { car: 'Škoda Kamiq 1.0 TSI', loc: 'Nitra, SK', price: 379000, tag: '−13 % pod trhem' },
  { car: 'Škoda Scala 1.0 TSI', loc: 'České Budějovice, CZ', price: 401000, tag: '−7 % pod trhem' },
  { car: 'Škoda Citigo 1.0 MPI', loc: 'Plzeň, CZ', price: 207000, tag: '−12 % pod trhem' },
  { car: 'Škoda Roomster 1.6 TDI', loc: 'Třebíč, CZ', price: 599000, tag: '−12 % pod trhem' },
  { car: 'Volkswagen Golf 6 1.6 TDI', loc: 'Žilina, SK', price: 375000, tag: '−9 % pod trhem' },
  { car: 'Volkswagen Golf 7 1.2 TSI', loc: 'Ostrava, CZ', price: 630000, tag: '−20 % pod trhem' },
  { car: 'Volkswagen Polo 1.2 TSI', loc: 'Přerov, CZ', price: 348000, tag: '−15 % pod trhem' },
  { car: 'Volkswagen Passat B7 2.0 TDI', loc: 'Drážďany, DE', price: 249000, tag: '−10 % pod trhem' },
  { car: 'Volkswagen Touran 1.6 TDI', loc: 'Ostrava, CZ', price: 215000, tag: '−13 % pod trhem' },
  { car: 'Volkswagen up! 1.0 MPI', loc: 'Praha, CZ', price: 243000, tag: '−6 % pod trhem' },
  { car: 'Volkswagen Jetta 1.6 TDI', loc: 'Ústí nad Labem, CZ', price: 482000, tag: '−18 % pod trhem' },
  { car: 'Volkswagen Caddy 2.0 TDI', loc: 'Opava, CZ', price: 502000, tag: '−9 % pod trhem' },
  { car: 'Hyundai i30 1.6 CRDi', loc: 'Kladno, CZ', price: 245000, tag: '−16 % pod trhem' },
  { car: 'Hyundai i20 1.2', loc: 'Znojmo, CZ', price: 257000, tag: '−8 % pod trhem' },
  { car: 'Hyundai ix20 1.4 CRDi', loc: 'Ostrava, CZ', price: 300000, tag: '−8 % pod trhem' },
  { car: 'Hyundai Tucson 1.7 CRDi', loc: 'Nitra, SK', price: 608000, tag: '−14 % pod trhem' },
  { car: 'Hyundai Accent 1.4', loc: 'Ostrava, CZ', price: 409000, tag: '−23 % pod trhem' },
  { car: 'Kia Ceed 1.6 CRDi', loc: 'Ústí nad Labem, CZ', price: 225000, tag: '−22 % pod trhem' },
  { car: 'Kia Rio 1.2', loc: 'Zlín, CZ', price: 345000, tag: '−7 % pod trhem' },
  { car: 'Kia Sportage 1.7 CRDi', loc: 'Znojmo, CZ', price: 618000, tag: '−14 % pod trhem' },
  { car: 'Kia Venga 1.4 CVVT', loc: 'Frýdek-Místek, CZ', price: 567000, tag: '−12 % pod trhem' },
  { car: 'Kia Picanto 1.0', loc: 'Třebíč, CZ', price: 298000, tag: '−10 % pod trhem' },
  { car: 'Renault Clio IV 1.2', loc: 'Pardubice, CZ', price: 305000, tag: '−16 % pod trhem' },
  { car: 'Renault Megane III 1.5 dCi', loc: 'Hradec Králové, CZ', price: 245000, tag: '−15 % pod trhem' },
  { car: 'Renault Captur 0.9 TCe', loc: 'Nitra, SK', price: 393000, tag: '−7 % pod trhem' },
  { car: 'Renault Scenic III 1.5 dCi', loc: 'Žilina, SK', price: 268000, tag: '−6 % pod trhem' },
  { car: 'Dacia Sandero 1.0 TCe', loc: 'Norimberk, DE', price: 231000, tag: '−15 % pod trhem' },
  { car: 'Dacia Duster 1.5 dCi', loc: 'Zlín, CZ', price: 461000, tag: '−18 % pod trhem' },
  { car: 'Dacia Logan 1.0 TCe', loc: 'Košice, SK', price: 311000, tag: '−16 % pod trhem' },
  { car: 'Dacia Sandero Stepway 0.9 TCe', loc: 'Přerov, CZ', price: 396000, tag: '−14 % pod trhem' },
  { car: 'Dacia Spring Electric', loc: 'Kladno, CZ', price: 548000, tag: '−6 % pod trhem' },
  { car: 'Peugeot 208 1.2 PureTech', loc: 'Plzeň, CZ', price: 445000, tag: '−10 % pod trhem' },
  { car: 'Peugeot 308 1.6 HDi', loc: 'Ostrava, CZ', price: 307000, tag: '−22 % pod trhem' },
  { car: 'Peugeot 2008 1.2 PureTech', loc: 'Jihlava, CZ', price: 315000, tag: '−17 % pod trhem' },
  { car: 'Peugeot 3008 1.6 HDi', loc: 'Plzeň, CZ', price: 480000, tag: '−22 % pod trhem' },
  { car: 'Citroën C3 1.2 PureTech', loc: 'Košice, SK', price: 360000, tag: '−8 % pod trhem' },
  { car: 'Citroën C4 1.6 HDi', loc: 'Most, CZ', price: 606000, tag: '−16 % pod trhem' },
  { car: 'Citroën Berlingo 1.6 HDi', loc: 'Brno, CZ', price: 624000, tag: '−13 % pod trhem' },
  { car: 'Opel Astra J 1.6 CDTI', loc: 'Most, CZ', price: 504000, tag: '−21 % pod trhem' },
  { car: 'Opel Corsa E 1.2', loc: 'Ústí nad Labem, CZ', price: 379000, tag: '−23 % pod trhem' },
  { car: 'Opel Insignia 2.0 CDTI', loc: 'Třebíč, CZ', price: 392000, tag: '−11 % pod trhem' },
  { car: 'Opel Mokka 1.6 CDTI', loc: 'Pardubice, CZ', price: 224000, tag: '−19 % pod trhem' },
  { car: 'Opel Zafira 1.6 CDTI', loc: 'Praha, CZ', price: 522000, tag: '−8 % pod trhem' },
  { car: 'Ford Fiesta 1.25', loc: 'Liberec, CZ', price: 391000, tag: '−22 % pod trhem' },
  { car: 'Ford Focus III 1.6 TDCi', loc: 'Přerov, CZ', price: 302000, tag: '−9 % pod trhem' },
  { car: 'Ford Mondeo IV 2.0 TDCi', loc: 'Liberec, CZ', price: 291000, tag: '−7 % pod trhem' },
  { car: 'Ford C-MAX 1.6 TDCi', loc: 'Brno, CZ', price: 378000, tag: '−14 % pod trhem' },
  { car: 'Ford Kuga 2.0 TDCi', loc: 'Znojmo, CZ', price: 357000, tag: '−15 % pod trhem' },
  { car: 'Toyota Yaris 1.33', loc: 'Karlovy Vary, CZ', price: 298000, tag: '−22 % pod trhem' },
  { car: 'Toyota Auris 1.4 D-4D', loc: 'Znojmo, CZ', price: 537000, tag: '−19 % pod trhem' },
  { car: 'Toyota Corolla 1.4 D-4D', loc: 'Třebíč, CZ', price: 568000, tag: '−15 % pod trhem' },
  { car: 'Toyota RAV4 2.0 D-4D', loc: 'Praha, CZ', price: 535000, tag: '−18 % pod trhem' },
  { car: 'Suzuki Swift 1.2', loc: 'Olomouc, CZ', price: 409000, tag: '−20 % pod trhem' },
  { car: 'Suzuki SX4 1.6', loc: 'Třebíč, CZ', price: 588000, tag: '−8 % pod trhem' },
  { car: 'Suzuki Vitara 1.6 DDiS', loc: 'Pardubice, CZ', price: 604000, tag: '−9 % pod trhem' },
  { car: 'Honda Civic 1.6 i-DTEC', loc: 'Košice, SK', price: 483000, tag: '−21 % pod trhem' },
  { car: 'Honda CR-V 2.0 i-VTEC', loc: 'Praha, CZ', price: 277000, tag: '−22 % pod trhem' },
  { car: 'Honda Jazz 1.4', loc: 'Nitra, SK', price: 287000, tag: '−22 % pod trhem' },
  { car: 'Mazda 3 1.6 MZR-CD', loc: 'Frýdek-Místek, CZ', price: 433000, tag: '−6 % pod trhem' },
  { car: 'Mazda CX-5 2.0 Skyactiv', loc: 'České Budějovice, CZ', price: 642000, tag: '−18 % pod trhem' },
  { car: 'Mazda 2 1.3', loc: 'Opava, CZ', price: 287000, tag: '−14 % pod trhem' },
  { car: 'Nissan Qashqai 1.5 dCi', loc: 'Drážďany, DE', price: 327000, tag: '−11 % pod trhem' },
  { car: 'Nissan Micra 1.2', loc: 'Košice, SK', price: 478000, tag: '−16 % pod trhem' },
  { car: 'Nissan Note 1.5 dCi', loc: 'Most, CZ', price: 293000, tag: '−19 % pod trhem' },
  { car: 'Nissan Leaf Electric', loc: 'Liberec, CZ', price: 427000, tag: '−11 % pod trhem' },
  { car: 'BMW 116d E87', loc: 'Přerov, CZ', price: 283000, tag: '−16 % pod trhem' },
  { car: 'BMW 316d F30', loc: 'Vídeň, AT', price: 219000, tag: '−11 % pod trhem' },
  { car: 'BMW 118i F20', loc: 'Karlovy Vary, CZ', price: 569000, tag: '−14 % pod trhem' },
  { car: 'Audi A3 1.6 TDI', loc: 'Brno, CZ', price: 357000, tag: '−20 % pod trhem' },
  { car: 'Audi A4 B8 2.0 TDI', loc: 'Bratislava, SK', price: 541000, tag: '−10 % pod trhem' },
  { car: 'Mercedes-Benz A170 CDI', loc: 'Praha, CZ', price: 480000, tag: '−13 % pod trhem' },
  { car: 'Mercedes-Benz B180 CDI', loc: 'Přerov, CZ', price: 274000, tag: '−9 % pod trhem' },
  { car: 'Mercedes-Benz C200 CDI W204', loc: 'Drážďany, DE', price: 376000, tag: '−7 % pod trhem' },
  { car: 'Fiat Panda 1.2', loc: 'Přerov, CZ', price: 384000, tag: '−15 % pod trhem' },
  { car: 'Fiat Punto 1.3 Multijet', loc: 'Norimberk, DE', price: 299000, tag: '−7 % pod trhem' },
  { car: 'Fiat Tipo 1.6 Multijet', loc: 'Ústí nad Labem, CZ', price: 509000, tag: '−24 % pod trhem' },
  { car: 'Fiat 500 1.2', loc: 'Opava, CZ', price: 644000, tag: '−8 % pod trhem' },
  { car: 'Seat Ibiza 1.2 TSI', loc: 'Třebíč, CZ', price: 483000, tag: '−18 % pod trhem' },
  { car: 'Seat Leon 1.6 TDI', loc: 'Liberec, CZ', price: 468000, tag: '−8 % pod trhem' },
  { car: 'Seat Altea 1.6 TDI', loc: 'Ostrava, CZ', price: 259000, tag: '−21 % pod trhem' },
  { car: 'MG ZS EV Electric', loc: 'Frýdek-Místek, CZ', price: 487000, tag: '−6 % pod trhem' },
  { car: 'MG5 Electric', loc: 'Ostrava, CZ', price: 284000, tag: '−12 % pod trhem' },
  { car: 'BYD Dolphin Electric', loc: 'Bratislava, SK', price: 237000, tag: '−12 % pod trhem' },
  { car: 'Renault Zoe Electric', loc: 'Ostrava, CZ', price: 534000, tag: '−15 % pod trhem' },
  { car: 'Volkswagen e-up! Electric', loc: 'Ústí nad Labem, CZ', price: 526000, tag: '−15 % pod trhem' },
  { car: 'Smart ForFour Electric', loc: 'Třebíč, CZ', price: 249000, tag: '−12 % pod trhem' },
  { car: 'Škoda Citigo-e iV Electric', loc: 'Drážďany, DE', price: 521000, tag: '−14 % pod trhem' },
  { car: 'Škoda Fabia 1.0 TSI', loc: 'Třebíč, CZ', price: 545000, tag: '−13 % pod trhem' },
  { car: 'Škoda Fabia 1.2 TSI', loc: 'Žilina, SK', price: 264000, tag: '−9 % pod trhem' },
  { car: 'Škoda Rapid 1.6 TDI', loc: 'Žilina, SK', price: 497000, tag: '−22 % pod trhem' },
  { car: 'Škoda Octavia 1.6 TDI', loc: 'Košice, SK', price: 425000, tag: '−12 % pod trhem' },
  { car: 'Škoda Octavia 1.4 TSI', loc: 'Žilina, SK', price: 371000, tag: '−17 % pod trhem' },
  { car: 'Škoda Octavia Combi 2.0 TDI', loc: 'Třebíč, CZ', price: 444000, tag: '−21 % pod trhem' },
  { car: 'Škoda Superb 1.8 TSI', loc: 'Ústí nad Labem, CZ', price: 456000, tag: '−13 % pod trhem' },
  { car: 'Škoda Yeti 1.2 TSI', loc: 'České Budějovice, CZ', price: 295000, tag: '−21 % pod trhem' },
];

/** Mise / hodnoty projektu („proč jsme to založili") */
export const MISSION_VALUES = [
  { icon: 'Users', title: 'Komunita na prvním místě', text: 'Místo, kde si lidi pomáhají, sdílí dealy a táhnou za jeden provaz.' },
  { icon: 'Unlock', title: 'Know-how pro každého', text: 'Nezáleží na věku ani na kapitálu. Stačí chuť se učit a makat.' },
  { icon: 'Eye', title: 'Hrajeme fér', text: 'Reálná čísla a reálné flipy. Žádné kečupy ani sliby o milionech přes noc.' },
];

/** Garance / důvěryhodnostní body (pod hero) */
export const GUARANTEES = [
  { icon: 'FileCheck2', title: 'Ověřený původ vozu', text: 'Prověřená historie, stav km i právní stav. Reporty ke každému autu.' },
  { icon: 'ShieldCheck', title: 'Smlouva a faktura', text: 'Vše papírově v pořádku — kupní smlouva i faktura na počkání.' },
  { icon: 'Undo2', title: '2měsíční garance', text: 'Nestihneš do 2 měsíců svůj první flip? Vrátíme ti členský poplatek.' },
  { icon: 'Headset', title: 'Podpora 7 dní v týdnu', text: 'Píšou ti reální lidé, ne bot. Odpovídáme obvykle do pár hodin.' },
];

/** Hodnocení / sociální důkaz (loga a skóre) */
export const RATINGS = [
  { source: 'Google', score: '4,9', count: '327 hodnocení', icon: 'Star' },
  { source: 'Heureka', score: '98 %', count: 'Ověřeno zákazníky', icon: 'BadgeCheck' },
  { source: 'Členů akademie', score: '1 800+', count: 'aktivní komunita', icon: 'Users' },
];

/** „Jak prověřujeme auta" — kroky budující důvěru u bazaru */
export const VERIFY_STEPS = [
  { icon: 'FileSearch', title: 'Původ a historie', text: 'Prověříme VIN, počet majitelů, servisní historii i skutečný stav km. Kontrolujeme odcizení, leasing a zástavy.' },
  { icon: 'Stethoscope', title: 'Technický stav', text: 'Diagnostika, prohlídka karoserie i podvozku a zkušební jízda. Závady odhalíme dřív než ty.' },
  { icon: 'Scale', title: 'Právní čistota', text: 'Ověření ve veřejných registrech — žádné skryté závazky ani nepříjemná překvapení po koupi.' },
  { icon: 'FileCheck2', title: 'Papíry na klíč', text: 'Kupní smlouva, faktura, přepis i řádně řešené DPH. Odjíždíš s autem a kompletní dokumentací.' },
];

/** „Jak to funguje" — proces ve 3 krocích */
export const HOW_STEPS = [
  { n: '01', icon: 'Search', title: 'Vyber, nebo se nauč', text: 'Koukni do bazaru na prověřená auta — nebo vstup do akademie a nauč se ziskové kusy hledat sám.' },
  { n: '02', icon: 'ClipboardCheck', title: 'Prověříme a doložíme', text: 'Technický i právní stav, kompletní papíry a smlouva. U vlastních flipů ti poradíme s opravou i cenou.' },
  { n: '03', icon: 'TrendingUp', title: 'Převezmi, nebo vydělej', text: 'Odjedeš s autem i se vším papírováním — nebo prodáš svůj flip se ziskem a jdeš do dalšího.' },
];

/** Firemní a kontaktní údaje (patička) */
export const COMPANY = {
  name: 'Nutriverse s.r.o.',
  ico: '139 65 433',
  dic: 'CZ13965433',
  address: 'Světova 523/1, 180 00 Praha 8',
  registry: 'Zapsáno u Městského soudu v Praze, oddíl C',
  email: 'predplatne@flipujkaru.cz',
  phone: '+420 605 977 665',
};

/** Platební metody (ikony v patičce / u ceníku) */
export const PAYMENTS = ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay', 'Bankovní převod'];

/** Navigační odkazy */
export const NAV_LINKS = [
  { href: '#proc-my', label: 'Proč my' },
  { href: '#marketplace', label: 'Bazar' },
  { href: '#kalkulacka', label: 'Kalkulačka' },
  { href: '#edukace', label: 'Akademie' },
  { href: '#cenik', label: 'Členství' },
  { href: '#faq', label: 'FAQ' },
];

/** Osobní servis pro členy — placená doplňková služba NAD RÁMEC členství
 *  AKADEMIE (1:1 schůzky se zakladateli + kompletní asistence s dovozem auta:
 *  health check, opravy, přepis do ČR). Cena je individuální, řeší se osobně. */
export const PERSONAL_SERVICE_STEPS = [
  { n: '01', title: 'Konzultace', text: 'rozpočet, model, výběr vozu' },
  { n: '02', title: 'Ověření', text: 'Dekra, Cebia, Carvertical, servisní historie' },
  { n: '03', title: 'Nákup a transport', text: 'obhlídka, koupě, doprava do ČR' },
  { n: '04', title: 'Byrokracie', text: 'přihlášení, STK, evidenční kontrola' },
  { n: '05', title: 'Doladění', text: 'kontakty na detailing a servis' },
  { n: '06', title: 'Prodej', text: 'inzerce, fotky, support při prodeji' },
];

/* ============ Pomocné formátování ============ */
export const czk = (n) => new Intl.NumberFormat('cs-CZ').format(Math.round(n)) + ' Kč';
export const kmFmt = (n) => new Intl.NumberFormat('cs-CZ').format(n) + ' km';
