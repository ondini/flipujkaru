/**
 * Logo FlipujKáru.
 * Značka = speedometr (rychlost) + jehla zlomená v profit-arrow nahoru (zisk).
 * Props: showWordmark (bool) — zobrazit textovou část.
 */
export function LogoMark({ className = 'w-7 h-7' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Oblouk speedometru */}
      <path d="M8 27a12 12 0 0 1 24 0" fill="none" stroke="#39FF14" strokeWidth="2.6" strokeLinecap="round" />
      {/* Jehla → šipka zisku */}
      <path d="M20 26 L27.5 12.5" stroke="#39FF14" strokeWidth="2.8" strokeLinecap="round" />
      {/* Střed + jemný kroužek */}
      <circle cx="20" cy="26" r="2.8" fill="#39FF14" />
      <circle cx="20" cy="26" r="5.5" fill="none" stroke="#39FF14" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export default function Logo({ showWordmark = true }) {
  return (
    <a href="#hero" className="group flex items-center gap-2.5" aria-label="FlipujKáru domů">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-ink-850 border border-white/10 overflow-hidden transition group-hover:border-accent/50">
        <LogoMark />
      </span>
      {showWordmark && (
        <span className="font-display text-xl font-bold tracking-tight text-white">
          Flipuj<span className="text-accent">Káru</span>
        </span>
      )}
    </a>
  );
}
