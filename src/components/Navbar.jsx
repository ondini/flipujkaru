import { useEffect, useState } from 'react';
import { Menu, ArrowRight, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import Logo from './Logo.jsx';
import { NAV_LINKS } from '../data/content.js';
import { usePath } from '../lib/router.js';
import { useApp } from '../AppContext.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState(''); // viditelná sekce na úvodní stránce
  const path = usePath();
  // Aktivní odkaz: na úvodu podle sekce v zorném poli, jinde podle adresy stránky
  const isActive = (l) => (path === '/'
    ? !!l.section && l.section === section
    : (l.match || [l.href]).some((h) => h === path || path.startsWith(`${h}/`)));
  const { user, openDashboard, openAuth, hasAccess: access, membershipLoaded, signOut } = useApp();
  // Přihlášený bez členství nemá do klientské zóny → tlačítko vede na platbu.
  // Dokud se členství načítá, ber ho jako člena (bez probliknutí „Aktivovat").
  const hasAccess = access || !membershipLoaded;
  const accountLabel = hasAccess ? 'Můj účet' : 'Aktivovat členství';

  // Změna pozadí navigace po odscrollování
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scrollspy — sleduje, která sekce je v zorném poli, a zvýrazní odkaz
  useEffect(() => {
    if (path !== '/') return undefined;
    const ids = NAV_LINKS.map((l) => l.section).filter(Boolean);
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setSection(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' } // aktivní = sekce u horního okraje
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [path]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-ink-950/80 backdrop-blur-xl border-white/5' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between">
        <Logo />

        {/* Odkazy (desktop) — aktivní má zelenou tečku */}
        <div className="hidden xl:flex items-center gap-7 whitespace-nowrap text-sm font-medium">
          {NAV_LINKS.map((l) => {
            const active = isActive(l);
            return (
              <a
                key={l.label}
                href={l.href}
                className={`relative py-1 transition ${active ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {l.label}
                {l.badge && <span className="ml-1.5 rounded bg-accent px-1 py-px align-[1px] text-[9px] font-bold leading-none text-ink-950">{l.badge}</span>}
                <span
                  className={`absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-all duration-300 ${
                    active ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={openDashboard}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110 hover:scale-[1.03] active:scale-95"
              >
                {hasAccess ? <LayoutDashboard className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />} {accountLabel}
              </button>
              {/* Bez členství se do administrace (kde je odhlášení) nedostane → odhlášení tady */}
              {!hasAccess && (
                <button onClick={signOut} aria-label="Odhlásit" title="Odhlásit" className="hidden sm:grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-zinc-300 transition hover:text-white">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                <LogIn className="w-4 h-4" /> Přihlásit
              </button>
              <a
                href="/cenik"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110 hover:scale-[1.03] active:scale-95"
              >
                Začít flipovat <ArrowRight className="w-4 h-4" />
              </a>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="xl:hidden grid place-items-center w-10 h-10 rounded-xl border border-white/10 text-white"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobilní menu */}
      {open && (
        <div className="xl:hidden border-t border-white/5 bg-ink-900/95 backdrop-blur px-6 py-4 space-y-2 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block py-2 transition ${isActive(l) ? 'text-accent' : 'text-zinc-300 hover:text-accent'}`}
            >
              {l.label}
              {l.badge && <span className="ml-2 rounded bg-accent px-1 py-px text-[10px] font-bold text-ink-950">{l.badge}</span>}
            </a>
          ))}
          {/* Účet (mobil) */}
          <button
            onClick={() => { setOpen(false); user ? openDashboard() : openAuth(); }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 font-semibold text-ink-950"
          >
            {user ? <><LayoutDashboard className="w-4 h-4" /> {accountLabel}</> : <><LogIn className="w-4 h-4" /> Přihlásit / Registrovat</>}
          </button>
          {user && !hasAccess && (
            <button onClick={() => { setOpen(false); signOut(); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 py-2.5 font-semibold text-zinc-300">
              <LogOut className="w-4 h-4" /> Odhlásit
            </button>
          )}
        </div>
      )}
    </header>
  );
}
