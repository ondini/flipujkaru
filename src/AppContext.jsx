import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, SUPABASE_READY } from './lib/supabase.js';
import { PLANS } from './data/content.js';

/* Sdílený stav aplikace: účty (Supabase), přepínání web ↔ administrace, checkout. */
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [view, setView] = useState('site'); // 'site' | 'dashboard'
  const [checkout, setCheckout] = useState(null); // { plan } | null
  const [member, setMember] = useState(null); // členství (Fáze C napojí na Stripe)
  const [user, setUser] = useState(null); // přihlášený uživatel (Supabase)
  const [isAdmin, setIsAdmin] = useState(false); // má účet roli admin?
  const [siteText, setSiteText] = useState({}); // editovatelné texty webu (z DB)
  const [authOpen, setAuthOpen] = useState(false); // okno přihlášení/registrace
  const [pendingPlan, setPendingPlan] = useState(null); // plán, který chtěl koupit před přihlášením
  const [pendingStripeSession, setPendingStripeSession] = useState(null); // { sessionId, email } — zaplaceno, čeká se na vytvoření účtu

  // Načte členství uživatele z databáze (profiles)
  const loadMembership = async (u) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('plan, subscription_status, current_period_end, role')
        .eq('id', u.id)
        .single();
      setIsAdmin(data?.role === 'admin');
      if (data?.plan && data.subscription_status === 'active') {
        const plan = PLANS.find((p) => p.name === data.plan);
        setMember(plan ? { plan, email: u.email, renews: data.current_period_end } : null);
      } else {
        setMember(null);
      }
    } catch {
      setMember(null);
      setIsAdmin(false);
    }
  };

  // Načte editovatelné texty webu (veřejné — i pro nepřihlášené)
  const reloadContent = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('content').select('key, value');
    if (data) setSiteText(Object.fromEntries(data.map((r) => [r.key, r.value])));
  };
  useEffect(() => { reloadContent(); }, []);

  // Sledování přihlášení + načtení členství
  useEffect(() => {
    if (!SUPABASE_READY) return;
    const apply = async (session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await loadMembership(u);
      else { setMember(null); setIsAdmin(false); }
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => apply(session));
    return () => sub.subscription.unsubscribe();
  }, []);

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
    } catch {
      // Záloha — použij uloženou volbu plánu
      const pending = JSON.parse(localStorage.getItem('fk_pending') || 'null');
      const plan = pending && PLANS.find((p) => p.name === pending.planName);
      if (plan) setMember({ plan, email: pending.email });
    } finally {
      localStorage.removeItem('fk_pending');
      setView('dashboard');
      window.scrollTo(0, 0);
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
      const { data: { session } } = SUPABASE_READY ? await supabase.auth.getSession() : { data: { session: null } };
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
    await supabase?.auth.signOut();
    setUser(null);
    setMember(null);
    setIsAdmin(false);
    setView('site');
    window.scrollTo(0, 0);
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
    else { setView('dashboard'); window.scrollTo(0, 0); }
  };

  // ---- Checkout ----
  // Nejdřív platba, účet vzniká až po ní — žádná přihlašovací brána před pokladnou.
  const startCheckout = (plan) => setCheckout({ plan });
  const closeCheckout = () => setCheckout(null);

  const completePurchase = ({ email, plan }) => {
    setMember({ email, plan });
    setCheckout(null);
    setView('dashboard');
    window.scrollTo(0, 0);
  };

  const openDashboard = () => { setView('dashboard'); window.scrollTo(0, 0); };
  const backToSite = () => { setView('site'); window.scrollTo(0, 0); };

  return (
    <AppContext.Provider
      value={{
        view, checkout, member, user, isAdmin, authOpen, siteText, reloadContent,
        startCheckout, closeCheckout, completePurchase, activateAfterCheckout, handleCheckoutReturn,
        pendingStripeSession,
        openDashboard, backToSite,
        signUp, signIn, signOut, resetPassword,
        openAuth, closeAuth, afterAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
