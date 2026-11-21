import { lazy, Suspense } from 'react';
import { ArrowRight, SearchX, Handshake } from 'lucide-react';
import Navbar from './Navbar.jsx';
import Hero from './Hero.jsx';
import { HomeGets, HomeLearn, HomeGroup, HomeMembership, HomeFlips, HomeContact } from './HomeSections.jsx';
import Marketplace from './Marketplace.jsx';
import SellCar from './SellCar.jsx';
import Verification from './Verification.jsx';
import HowItWorks from './HowItWorks.jsx';
import ProfitCalculator from './ProfitCalculator.jsx';
import Education from './Education.jsx';
import Mission from './Mission.jsx';
import Pricing from './Pricing.jsx';
import PersonalService from './PersonalService.jsx';
import Faq from './Faq.jsx';
import Footer from './Footer.jsx';
import LegalPage from './LegalPage.jsx';
import { LEGAL_PAGES } from '../data/legal.js';
import { matchRoute } from '../seo/site.js';
import { usePath } from '../lib/router.js';

const SellCarForm = lazy(() => import('./SellCarForm.jsx'));

/** Nadpis stránky pro vyhledávače a čtečky (sekce mají vlastní vizuální nadpisy h3). */
const H1 = ({ children }) => <h1 className="sr-only">{children}</h1>;

/** Rozcestník na stránce Členství (ceník · osobní servis · dotazy). */
function MembershipNav() {
  const items = [['#cenik', 'Ceník'], ['#osobni-servis', 'Osobní servis'], ['#faq', 'Časté dotazy']];
  return (
    <nav aria-label="Na této stránce" className="mx-auto mt-8 flex max-w-7xl justify-center px-6">
      <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl border border-white/10 bg-ink-850 p-1.5 text-sm font-semibold">
        {items.map(([href, label]) => (
          <a key={href} href={href} className="rounded-xl px-4 py-2 text-zinc-300 transition hover:bg-white/5 hover:text-white">{label}</a>
        ))}
      </div>
    </nav>
  );
}

/** Odkaz z Akademie na osobní servis (žije na stránce Členství). */
function ServiceTeaser() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-5 rounded-3xl border border-accent/25 bg-ink-850 p-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent"><Handshake className="h-4 w-4" /> Osobní servis pro členy</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-white">Nechceš flipovat sám? Uděláme to za tebe.</h3>
            <p className="mt-2 text-sm text-zinc-400">1:1 servis se zakladateli od výběru auta po prodej, včetně dovozu. Placená služba nad rámec členství.</p>
          </div>
          <a href="/cenik#osobni-servis" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
            Jak to funguje <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Obsah jednotlivých stránek veřejného webu. */
function PageContent({ route }) {
  switch (route.key) {
    case '/':
      return (
        <>
          <H1>FlipujKáru — prověřená auta a komunita, která tě naučí flipovat se ziskem</H1>
          <Hero />
          <HomeGets />
          <HomeLearn />
          <HomeGroup />
          <HomeMembership />
          <HomeFlips />
          <SellCar />
          <HomeContact />
        </>
      );
    case '/bazar':
      return <><H1>Bazar prověřených aut</H1><Marketplace routeView="sale" /><Verification /><HowItWorks /></>;
    case '/nase-flipy':
      return <><H1>Naše flipy — prodaná auta a jejich příběhy</H1><Marketplace routeView="flips" /></>;
    case '/auto':
      return <Marketplace carSlug={route.slug} />;
    case '/prodej-auta':
      return <><H1>Prodáme ti auto — prodej auta za tebe</H1><SellCar /></>;
    case '/akademie':
      return <><H1>Car-flipping akademie FlipujKáru</H1><Education /><HowItWorks /><Mission /><ServiceTeaser /></>;
    case '/kalkulacka':
      return <><H1>Kalkulačka zisku z flipu auta</H1><ProfitCalculator /></>;
    case '/cenik':
      return <><H1>Členství FlipujKáru — ceník, osobní servis a časté dotazy</H1><MembershipNav /><Pricing /><PersonalService /><Faq /></>;
    default:
      return <NotFound />;
  }
}

/** Veřejný web — vybere stránku podle adresy. */
export default function SiteLanding() {
  const route = matchRoute(usePath());
  const legal = LEGAL_PAGES[route.key.slice(1)];

  if (legal) return <LegalPage page={legal} />;
  if (route.key === '/prodej-auta/formular') {
    return <Suspense fallback={<div className="min-h-screen bg-ink-950" />}><SellCarForm /></Suspense>;
  }

  return (
    <>
      <Navbar />
      <main className={route.key === '/' ? '' : 'pt-16'}>
        <PageContent route={route} />
      </main>
      <Footer />
    </>
  );
}

export function NotFound() {
  const links = [['/bazar', 'Bazar aut'], ['/prodej-auta', 'Prodej auta'], ['/akademie', 'Akademie'], ['/cenik', 'Členství']];
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-xl px-6 text-center">
        <SearchX className="mx-auto h-12 w-12 text-accent" />
        <h1 className="mt-5 font-display text-4xl font-bold text-white md:text-5xl">Tohle tu není</h1>
        <p className="mt-3 text-zinc-400">Stránka neexistuje nebo už byla odstraněna (třeba prodané auto). Zkus některou z těchhle:</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-ink-950 shadow-glow transition hover:brightness-110">
            Úvodní stránka <ArrowRight className="h-4 w-4" />
          </a>
          {links.map(([href, label]) => (
            <a key={href} href={href} className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5">{label}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
