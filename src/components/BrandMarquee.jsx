const BRANDS = ['BMW', 'Audi', 'Porsche', 'Mercedes-AMG', 'Toyota', 'Nissan GT-R', 'Škoda', 'Volkswagen', 'Ford', 'Subaru'];

/** Nekonečně se posouvající pás značek (zdvojený seznam = plynulá smyčka) */
export default function BrandMarquee() {
  return (
    <div className="relative mt-20 overflow-hidden border-y border-white/5 py-5">
      <div className="flex w-max animate-marquee gap-12 px-6 font-display text-lg font-semibold text-zinc-600">
        {[...BRANDS, ...BRANDS].map((b, i) => (
          <span key={i} className="whitespace-nowrap">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
