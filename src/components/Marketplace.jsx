import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Car, TrendingUp } from 'lucide-react';
import { CARS, FLIPS, FILTERS, MARKET_VIEWS } from '../data/content.js';
import { supabase } from '../lib/supabase.js';
import { useApp } from '../AppContext.jsx';
import Reveal from './Reveal.jsx';
import CarCard from './CarCard.jsx';
import FlipCard from './FlipCard.jsx';

// Detaily (modaly) → lazy, stáhnou se až při otevření auta/flipu
const CarDetailModal = lazy(() => import('./CarDetailModal.jsx'));
const FlipModal = lazy(() => import('./FlipModal.jsx'));

// Ikony pro přepínač režimů
const VIEW_ICONS = { Car, TrendingUp };

// Řádek z databáze → tvar, který očekává karta auta
const mapCar = (r) => {
  const images = Array.isArray(r.images) && r.images.length ? r.images : r.image_url ? [r.image_url] : [];
  return {
    brand: r.brand, model: r.model, year: r.year, km: r.km, price: r.price,
    category: r.category, engine: r.engine, condition: r.condition, vat: r.vat,
    badge: r.badge_text ? { text: r.badge_text, tone: r.badge_tone || 'accent' } : null,
    img: images[0] || r.image_url,
    images,
  };
};

export default function Marketplace() {
  const [view, setView] = useState('sale'); // 'sale' | 'flips'
  const [filter, setFilter] = useState('vse');
  const [activeFlip, setActiveFlip] = useState(null); // otevřený detail flipu
  const [activeCar, setActiveCar] = useState(null); // otevřený detail auta
  const [allCars, setAllCars] = useState(CARS); // fallback = statická data, dokud nenačteme z DB
  const { siteText: t } = useApp();

  // Načtení aut z databáze (publikovaná). Když DB není/prázdná, zůstanou statická.
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('cars')
      .select('*')
      .neq('status', 'draft')
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length) setAllCars(data.map(mapCar));
      });
  }, []);

  const cars = useMemo(
    () => (filter === 'vse' ? allCars : allCars.filter((c) => c.category === filter)),
    [filter, allCars]
  );

  return (
    <section id="marketplace" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Hlavička */}
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{t.market_eyebrow || 'Marketplace'}</span>
          <h3 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            {t.market_title || 'Auta, na kterých se vydělává'}
          </h3>
          <p className="mt-3 text-zinc-400">
            {t.market_subtitle || 'Prohlédni si naše prověřené kusy na prodej — nebo reálné flipy, které prošly akademií.'}
          </p>
        </Reveal>

        {/* Přepínač režimů (tabs) — na mobilu přes celou šířku, ať se vždy vejde */}
        <Reveal delay={80} className="mt-8 flex w-full rounded-2xl border border-white/10 bg-ink-850 p-1.5 sm:inline-flex sm:w-auto">
          {MARKET_VIEWS.map((v) => {
            const Icon = VIEW_ICONS[v.icon];
            const active = view === v.key;
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition sm:flex-none sm:px-4 ${
                  active ? 'bg-accent text-ink-950 shadow-glow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {v.label}
              </button>
            );
          })}
        </Reveal>

        {/* ===== REŽIM: PRODEJ ===== */}
        {view === 'sale' && (
          <>
            {/* Rychlý filtr kategorií */}
            <div className="mt-6 flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      active ? 'bg-white/10 text-white border border-accent/40' : 'border border-white/10 text-zinc-400 hover:border-white/30'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, i) => (
                <Reveal key={car.brand + car.model} delay={i * 40}>
                  <CarCard car={car} onOpen={() => setActiveCar(car)} />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* ===== REŽIM: ÚSPĚŠNÉ FLIPY ===== */}
        {view === 'flips' && (
          <>
            <p className="mt-6 text-sm text-zinc-400">
              Reálná čísla členů akademie. <span className="text-accent">Nákup → po opravě → prodej</span> — a co zbylo v kapse.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FLIPS.map((flip, i) => (
                <Reveal key={flip.brand + flip.model + i} delay={i * 40}>
                  <FlipCard flip={flip} onOpen={() => setActiveFlip(flip)} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a href="#cenik" className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-ink-950 shadow-glow transition hover:brightness-110 hover:scale-[1.02]">
                Chci flipovat taky <TrendingUp className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Detail auta + flipu — mountují se až při otevření */}
      {activeCar && (
        <Suspense fallback={null}>
          <CarDetailModal car={activeCar} onClose={() => setActiveCar(null)} />
        </Suspense>
      )}
      {activeFlip && (
        <Suspense fallback={null}>
          <FlipModal flip={activeFlip} onClose={() => setActiveFlip(null)} />
        </Suspense>
      )}
    </section>
  );
}
