import { lazy, Suspense, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext.jsx';
import SiteLanding from './components/SiteLanding.jsx'; // veřejný web = první obrazovka → eager (LCP)
import LegalPage from './components/LegalPage.jsx';
import { LEGAL_PAGES } from './data/legal.js';

// Nekritické části → lazy chunky, načtou se až při interakci (mimo initial bundle)
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const Checkout = lazy(() => import('./components/Checkout.jsx'));
const AuthModal = lazy(() => import('./components/AuthModal.jsx'));

// Právní stránky (/obchodni-podminky, /cookies, /gdpr) — vlastní URL, žádný
// router navíc. Vyřešíme čistě cestou v adrese, mimo přihlašování/pokladnu.
const legalSlug = window.location.pathname.replace(/^\/|\/$/g, '');

/**
 * Kořen aplikace: přepíná veřejný web ↔ klientskou administraci,
 * drží nad vším pokladnu a zpracuje návrat z platby (Stripe).
 */
function Root() {
  const { view, checkout, authOpen, handleCheckoutReturn } = useApp();

  // Návrat ze Stripe Checkout: ?checkout=success&session_id=… → ověř platbu.
  // Pay-first: pokud uživatel ještě nemá účet, handleCheckoutReturn otevře
  // registraci a členství dokončí až po jejím založení.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('checkout');
    if (!status) return;
    const cleanUrl = () => window.history.replaceState({}, '', window.location.pathname);
    if (status === 'success') {
      handleCheckoutReturn(params.get('session_id')).finally(cleanUrl);
    } else {
      cleanUrl();
    }
  }, [handleCheckoutReturn]);

  return (
    <div className="grain">
      {view === 'dashboard' ? (
        <Suspense fallback={<FullLoader />}>
          <Dashboard />
        </Suspense>
      ) : (
        <SiteLanding />
      )}

      {/* Pokladna + přihlášení se stáhnou až když je uživatel otevře */}
      {checkout && <Suspense fallback={null}><Checkout /></Suspense>}
      {authOpen && <Suspense fallback={null}><AuthModal /></Suspense>}
    </div>
  );
}

/** Jednoduchý fallback při načítání administrace */
function FullLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-accent" />
    </div>
  );
}

export default function App() {
  // Právní stránky nepotřebují přihlašování ani pokladnu → mimo AppProvider.
  if (LEGAL_PAGES[legalSlug]) return <LegalPage page={LEGAL_PAGES[legalSlug]} />;

  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
