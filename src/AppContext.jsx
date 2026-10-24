import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, SUPABASE_READY } from './lib/supabase.js';
import { PLANS } from './data/content.js';
import { DEFAULT_BILLING } from './config/billing.js';
import { savePaidSession, getPaidSession } from './lib/telegram.js';

/* Sdílený stav aplikace: účty (Supabase), přepínání web ↔ administrace, checkout. */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [view, setView] = useState('site'); // 'site' | 'dashboard'
  const [checkout, setCheckout] = useState(null); // { plan, billing } | null
  const [member, setMember] = useState(null); // členství (Fáze C napojí na Stripe)
  const [user, setUser] = useState(null); // přihlášený uživatel (Supabase)
  const [isAdmin, setIsAdmin] = useState(false); // má účet roli admin?
  const [membershipLoaded, setMembershipLoaded] = useState(!SUPABASE_READY); // členství přihlášeného účtu už načtené?
  const [activationError, setActivationError] = useState(null); // sessionId zaplacené platby, jejíž aktivace selhala
  const [siteText, setSiteText] = useState({}); // editovatelné texty webu (z DB)
  const [authOpen, setAuthOpen] = useState(false); // okno přihlášení/registrace
  const [pendingPlan, setPendingPlan] = useState(null); // plán, který chtěl koupit před přihlášením
  const [pendingStripeSession, setPendingStripeSession] = useState(null); // { sessionId, email } — zaplaceno, čeká se na vytvoření účtu
  const [justPaidSession, setJustPaidSession] = useState(null); // právě zaplacená Checkout Session → tlačítko „Otevřít Telegram"
  const [telegramSession, setTelegramSession] = useState(getPaidSession); // Checkout Session pro „Propojit Telegram" v kabinetu
  const [telegramLinked, setTelegramLinked] = useState(false); // bot nahlásil vstup do skupiny (telegram_links)

  // Načte členství uživatele z databáze (profiles). Jeden retry po krátké
  // prodlevě při chybě (přechodná síťová/RLS timing chyba), než se vzdá.
  // Vrací, jestli má účet přístup do klientské zóny (aktivní členství / admin).
  const loadMembership = async (u, retry = true) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, subscription_status, current_period_end, role')
        .eq('id', u.id)
        .single();
      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
      // Session ID poslední platby (pro Telegram) — zvlášť a best-effort, ať
      // chybějící sloupec (nespuštěná migrace) nerozbije načtení členství.
      supabase.from('profiles').select('stripe_checkout_session_id').eq('id', u.id).single()
        .then(({ data: d }) => { if (d?.stripe_checkout_session_id) setTelegramSession(d.stripe_checkout_session_id); });
      const plan = data?.plan && data.subscription_status === 'active' ? PLANS.find((p) => p.name === data.plan) : null;
      setMember(plan ? { plan, email: u.email, renews: data.current_period_end } : null);
      return !!plan || data?.role === 'admin';
    } catch {
      if (retry) {
        await new Promise((r) => setTimeout(r, 800));
        return loadMembership(u, false);
      }
      setMember(null);
      setIsAdmin(false);
      return false;
    }
  };

  // Načte editovatelné texty webu (veřejné — i pro nepřihlášené)
  const reloadContent = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('content').select('key, value');
    if (data) setSiteText(Object.fromEntries(data.map((r) => [r.key, r.value])));
  };
  useEffect(() => { reloadContent(); }, []);

  // Sledování přihlášení + načtení členství. Spoléháme jen na
  // onAuthStateChange — supabase-js v2 při odběru sám vystřelí počáteční
  // INITIAL_SESSION event, takže samostatné getSession() by běželo souběžně
  // a spouštělo dva paralelní loadMembership() běhy bez pořadí/cancelace.
  useEffect(() => {
    if (!SUPABASE_READY) return;
    const apply = async (session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) { setMembershipLoaded(false); await loadMembership(u); }
      else { setMember(null); setIsAdmin(false); }
      setMembershipLoaded(true);
    };
    // Callback NESMÍ čekat na další Supabase dotaz: supabase-js ho volá pod
    // auth zámkem a await na dotaz (ten si bere session = stejný zámek) zámek
    // zablokuje navždy — po obnově tokenu (návrat na tab, expirace) pak visí
    // VŠECHNY dotazy (Moje flipy, Žebříčky, role admina…). Proto odložit.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { setTimeout(() => apply(session), 0); });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Vstoupil už člen do Telegram skupiny? Zapisuje bot přes /api/telegram-linked;
  // RLS pustí jen záznam k platbě přihlášeného účtu. Best-effort (bez tabulky = false).
  useEffect(() => {
    if (!user || !telegramSession) { setTelegramLinked(false); return; }
    supabase.from('telegram_links').select('session_id').eq('session_id', telegramSession).maybeSingle()
      .then(({ data }) => setTelegramLinked(!!data));
  }, [user, telegramSession]);

  // Poté, co je uživatel přihlášen (nově vytvořený nebo existující účet):
  // ověř platbu u backendu a zapiš členství k účtu, pak otevři administraci.
  const activateAfterCheckout = async (sessionId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nepřihlášeno.');
      const res = await fetch('/api/activate-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Aktivace selhala.');
      await loadMembership(session.user);
      setActivationError(null);
      localStorage.removeItem('fk_pending');
      setView('dashboard');
      window.scrollTo(0, 0);
    } catch {
      // Žádné členství „na důvěru" z prohlížeče — přístup dává jen ověřená platba.
      // Uživatel zůstane na webu s výzvou zkusit aktivaci znovu (ActivationError).
      setActivationError(sessionId);
    }
  };

  // Návrat ze Stripe (?checkout=success): zaplaceno nejdřív, účet až teď.
  // Ověříme platbu veřejným (nepřihlášeným) endpointem — pokud uživatel ještě
  // nemá účet, otevřeme registraci předvyplněnou platebním e-mailem a členství
  // dokončíme, jakmile si účet založí (viz afterAuth).
  const handleCheckoutReturn = async (sessionId) => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (!data.paid) return;
      setJustPaidSession(sessionId);
      setTelegramSession(sessionId);
      savePaidSession(sessionId);
      const { data: { session } } = SUPABASE_READY ? await supabase.auth.getSession() : { data: { session: null } };
      const paidEmail = (data.email || '').trim().toLowerCase();
      const accountEmail = (session?.user?.email || '').trim().toLowerCase();

      // Zaplaceno pod jiným e-mailem, než je právě přihlášený účet → členství
      // patří plátci, ne tomu, kdo je zrovna přihlášený. Odhlásíme a necháme
      // dokončit přes účet odpovídající platbě (přihlášení/registrace plátce).
      if (session && paidEmail && accountEmail && paidEmail !== accountEmail) {
        setUser(null); setMember(null); setIsAdmin(false);
        try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* bez session nevadí */ }
        setPendingStripeSession({ sessionId, email: data.email || '' });
        setAuthOpen(true);
        return;
      }

      if (session) {
        await activateAfterCheckout(sessionId);
      } else {
        setPendingStripeSession({ sessionId, email: data.email || '' });
        setAuthOpen(true);
      }
    } catch {
      // Backend nedostupný — necháme uživatele dokončit registraci ručně přes navbar.
    }
  };

  // ---- Auth akce ----
  const signUp = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase není nakonfigurované.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
    return { session: data.session }; // session=null → je potřeba potvrdit e-mail
  };

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase není nakonfigurované.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    if (!supabase) throw new Error('Supabase není nakonfigurované.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) throw error;
  };

  const signOut = async () => {
    // Vyčisti stav hned — ať tlačítko vždy reaguje, i kdyby volání Supabase
    // selhalo nebo se zaseklo (známý deadlock na auth zámku v prohlížeči).
    setUser(null);
    setMember(null);
    setIsAdmin(false);
    setView('site');
    window.scrollTo(0, 0);
    try {
      // scope: 'local' = odhlásí jen tento prohlížeč a nečeká na síťové ověření,
      // takže odhlášení projde i s expirovaným tokenem / bez připojení.
      await supabase?.auth.signOut({ scope: 'local' });
    } catch {
      // Ignorujeme (např. chybějící/expirovaná session) — stav už je vyčištěný.
    }
    // Pojistka: odstraň uložený token, ať se po reloadu nikdo nepřihlásí zpět.
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('sb-') && k.endsWith('-auth-token'))
        .forEach((k) => localStorage.removeItem(k));
    } catch { /* localStorage nemusí být dostupné (privátní režim) */ }
  };

  // ---- Přihlašovací okno ----
  const openAuth = (plan = null) => { setPendingPlan(plan); setAuthOpen(true); };
  const closeAuth = () => { setAuthOpen(false); setPendingPlan(null); };

  // Po úspěšném přihlášení/registraci: dokonči rozdělanou platbu (pay-first),
  // jinak měl rozdělaný nákup → checkout, jinak → administrace.
  const afterAuth = async () => {
    setAuthOpen(false);
    if (pendingStripeSession) {
      const { sessionId } = pendingStripeSession;
      setPendingStripeSession(null);
      await activateAfterCheckout(sessionId);
      return;
    }
    if (pendingPlan) { setCheckout(pendingPlan); setPendingPlan(null); }
    else await openDashboard(); // bez zaplaceného členství → rovnou na platbu
  };

  // ---- Checkout ----
  // Nejdřív platba, účet vzniká až po ní — žádná přihlašovací brána před pokladnou.
  const startCheckout = (plan, billing = DEFAULT_BILLING) => setCheckout({ plan, billing });
  const closeCheckout = () => setCheckout(null);

  const completePurchase = ({ email, plan }) => {
    setMember({ email, plan });
    setCheckout(null);
    setView('dashboard');
    window.scrollTo(0, 0);
  };

  // Do klientské zóny jen s aktivním (zaplaceným) členstvím, nebo jako admin.
  const hasAccess = !!member || isAdmin;
  const startDefaultCheckout = () => setCheckout({ plan: PLANS[0], billing: DEFAULT_BILLING });
  // Nečlen se přihlásil/registroval → nemá už zaplaceno? (pay-first, zavřená
  // záložka před založením účtu). Nejdřív platba uložená v tomto prohlížeči
  // (ověřitelná session), pak dohledání aktivního předplatného podle e-mailu.
  const claimMembership = async (session) => {
    const call = async (body) => {
      try {
        const res = await fetch('/api/activate-membership', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(body),
        });
        return await res.json();
      } catch { return {}; }
    };
    const stored = getPaidSession();
    let data = stored ? await call({ sessionId: stored }) : {};
    if (!data.ok) data = await call({});
    if (!data.ok) return false;
    if (data.sessionId) { setTelegramSession(data.sessionId); savePaidSession(data.sessionId); }
    return loadMembership(session.user);
  };

  // Rozhoduje až nad čerstvě načteným členstvím — stav z onAuthStateChange
  // se po přihlášení doplňuje se zpožděním a zaplacený člen by jinak skončil v pokladně.
  const openDashboard = async () => {
    const { data: { session } } = SUPABASE_READY ? await supabase.auth.getSession() : { data: { session: null } };
    const access = session ? (await loadMembership(session.user)) || (await claimMembership(session)) : false;
    if (!access) { startDefaultCheckout(); return; }
    setView('dashboard'); window.scrollTo(0, 0);
  };
  const backToSite = () => { setView('site'); window.scrollTo(0, 0); };

  return (
    <AppContext.Provider
      value={{
        view, checkout, member, user, isAdmin, authOpen, siteText, reloadContent,
        startCheckout, closeCheckout, completePurchase, activateAfterCheckout, handleCheckoutReturn,
        pendingStripeSession, justPaidSession, telegramSession, telegramLinked, dismissJustPaid: () => setJustPaidSession(null),
        openDashboard, backToSite, hasAccess, membershipLoaded, startDefaultCheckout, activationError,
        signUp, signIn, signOut, resetPassword,
        openAuth, closeAuth, afterAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
