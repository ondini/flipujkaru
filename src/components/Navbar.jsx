import { useEffect, useState } from 'react';
import { Menu, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react';
import Logo from './Logo.jsx';
import { NAV_LINKS } from '../data/content.js';
import { useApp } from '../AppContext.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const { user, openDashboard, openAuth } = useApp();

  // Změna pozadí navigace po odscrollování
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scrollspy — sleduje, která sekce je v zorném poli, a zvýrazní odkaz
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive('#' + e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' } // aktivní = sekce u horního okraje
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-ink-950/80 backdrop-blur-xl border-white/5' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between">
        <Logo />

        {/* Odkazy (desktop) — aktivní má zelenou tečku */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href;
            return (
              <a
                key={l.label}
                href={l.href}
                onClick={() => { if (l.view) window.dispatchEvent(new CustomEvent('marketplace:setview', { detail: l.view })); }}
                className={`relative py-1 transition ${isActive ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent transition-all duration-300 ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={openDashboard}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110 hover:scale-[1.03] active:scale-95"
            >
              <LayoutDashboard className="w-4 h-4" /> Můj účet
            </button>
          ) : (
            <>
              <button
                onClick={() => openAuth()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                <LogIn className="w-4 h-4" /> Přihlásit
              </button>
              <a
                href="#cenik"
                className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110 hover:scale-[1.03] active:scale-95"
              >
                Začít flipovat <ArrowRight className="w-4 h-4" />
              </a>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden grid place-items-center w-10 h-10 rounded-xl border border-white/10 text-white"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobilní menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink-900/95 backdrop-blur px-6 py-4 space-y-2 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => { setOpen(false); if (l.view) window.dispatchEvent(new CustomEvent('marketplace:setview', { detail: l.view })); }}
              className={`block py-2 transition ${active === l.href ? 'text-accent' : 'text-zinc-300 hover:text-accent'}`}
            >
              {l.label}
            </a>
          ))}
          {/* Účet (mobil) */}
          <button
            onClick={() => { setOpen(false); user ? openDashboard() : openAuth(); }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 font-semibold text-ink-950"
          >
            {user ? <><LayoutDashboard className="w-4 h-4" /> Můj účet</> : <><LogIn className="w-4 h-4" /> Přihlásit / Registrovat</>}
          </button>
        </div>
      )}
    </header>
  );
}
