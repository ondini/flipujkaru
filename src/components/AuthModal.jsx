import { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, ArrowRight, PartyPopper } from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { LogoMark } from './Logo.jsx';

/** Přihlášení / registrace / reset hesla (e-mail + heslo přes Supabase). */
export default function AuthModal() {
  const { authOpen, closeAuth, signIn, signUp, resetPassword, afterAuth, pendingStripeSession } = useApp();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'reset'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Pay-first: platba už proběhla, teď jen dokončíme účet → rovnou registrace, e-mail předvyplněný.
  useEffect(() => {
    if (authOpen && pendingStripeSession) {
      setMode('register');
      setForm((f) => ({ ...f, email: pendingStripeSession.email || f.email }));
    }
  }, [authOpen, pendingStripeSession]);

  if (!authOpen) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const switchMode = (m) => { setMode(m); setError(''); setInfo(''); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setInfo('');
    try {
      if (mode === 'login') {
        await signIn(form.email, form.password);
        afterAuth();
      } else if (mode === 'register') {
        const { session } = await signUp(form.email, form.password, form.name);
        if (session) afterAuth(); // potvrzení e-mailu je vypnuté → rovnou přihlášen
        else setInfo('Hotovo! Poslali jsme ti ověřovací e-mail — klikni na odkaz a pak se přihlas.');
      } else {
        await resetPassword(form.email);
        setInfo('Poslali jsme ti e-mail s odkazem na obnovu hesla.');
      }
    } catch (err) {
      setError(translate(err.message));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    login: { h: 'Přihlášení', sub: 'Vítej zpět. Pokračuj do svého účtu.' },
    register: { h: 'Vytvořit účet', sub: 'Pár vteřin a jsi součástí komunity.' },
    reset: { h: 'Obnova hesla', sub: 'Zadej e-mail a pošleme ti odkaz.' },
  }[mode];

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={closeAuth}
      role="dialog"
      aria-modal="true"
      aria-label="Přihlášení"
    >
      <div className="animate-fade-up w-full max-w-md overflow-hidden rounded-t-3xl border border-white/10 bg-ink-900 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink-850"><LogoMark className="h-6 w-6" /></span>
            <div>
              <div className="font-display font-bold text-white">{titles.h}</div>
              <div className="text-xs text-zinc-500">{titles.sub}</div>
            </div>
          </div>
          <button onClick={closeAuth} aria-label="Zavřít" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 p-6">
          {pendingStripeSession && (
            <p className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-soft p-3 text-sm text-accent">
              <PartyPopper className="mt-0.5 h-4 w-4 shrink-0" /> Platba proběhla! Dokonči si účet a hned ti aktivujeme členství.
            </p>
          )}
          {mode === 'register' && (
            <Field icon={User} label="Jméno" value={form.name} onChange={set('name')} placeholder="Jan Novák" autoComplete="name" required />
          )}
          <Field icon={Mail} label="E-mail" type="email" value={form.email} onChange={set('email')} placeholder="tvuj@email.cz" autoComplete="email" required />
          {mode !== 'reset' && (
            <Field icon={Lock} label="Heslo" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} />
          )}

          {error && <p className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>}
          {info && <p className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent-soft p-3 text-sm text-accent"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {info}</p>}

          <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-semibold text-ink-950 shadow-glow transition enabled:hover:brightness-110 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === 'login' ? 'Přihlásit se' : mode === 'register' ? 'Vytvořit účet' : 'Poslat odkaz'} <ArrowRight className="h-4 w-4" /></>}
          </button>

          {/* Přepínání režimů */}
          <div className="pt-1 text-center text-sm text-zinc-400">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => switchMode('reset')} className="text-zinc-400 hover:text-white">Zapomenuté heslo?</button>
                <div className="mt-2">Nemáš účet? <button type="button" onClick={() => switchMode('register')} className="font-semibold text-accent hover:underline">Zaregistruj se</button></div>
              </>
            )}
            {mode === 'register' && (
              <div>Už máš účet? <button type="button" onClick={() => switchMode('login')} className="font-semibold text-accent hover:underline">Přihlas se</button></div>
            )}
            {mode === 'reset' && (
              <button type="button" onClick={() => switchMode('login')} className="font-semibold text-accent hover:underline">Zpět na přihlášení</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/** Přeloží nejčastější chyby Supabase do češtiny */
function translate(msg = '') {
  if (/Invalid login credentials/i.test(msg)) return 'Špatný e-mail nebo heslo.';
  if (/already registered|already exists/i.test(msg)) return 'Tento e-mail už je registrovaný. Přihlas se.';
  if (/Email not confirmed/i.test(msg)) return 'Nejdřív potvrď e-mail (klikni na odkaz v e-mailu).';
  if (/Password should be at least/i.test(msg)) return 'Heslo musí mít aspoň 6 znaků.';
  if (/not configured/i.test(msg)) return 'Účty zatím nejsou nastavené (chybí klíče Supabase).';
  return msg;
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input {...props} className="w-full rounded-xl border border-white/10 bg-ink-950 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20" />
      </div>
    </label>
  );
}
