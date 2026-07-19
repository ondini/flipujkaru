# FlipujKáru 🏎️

Bazar prověřených aut **+** prémiová car-flipping akademie. Jednostránkový web postavený na **React + Vite + Tailwind CSS**.

## Spuštění

```bash
npm install      # nainstaluje závislosti
npm run dev      # vývojový server (http://localhost:5173)
npm run build    # produkční build do /dist
npm run preview  # náhled produkčního buildu
```

## Stack

- **React 18** + **Vite 6** — rychlý dev server a build
- **Tailwind CSS 3** — design tokeny v `tailwind.config.js`
- **lucide-react** — ikony
- Fonty **Inter** (text) + **Space Grotesk** (nadpisy) z Google Fonts (linkované v `index.html`)

## Struktura

```
src/
├─ main.jsx              # vstupní bod
├─ App.jsx               # skládá sekce dohromady
├─ index.css            # Tailwind + globální efekty (grid, zrno, gradient text…)
├─ data/
│  └─ content.js         # VŠECHEN obsah: auta, plány, FAQ, recenze, formátování
├─ hooks/
│  └─ useCountUp.js       # animovaná počítadla ve viewportu
└─ components/
   ├─ Logo.jsx            # značka (speedometr + profit-arrow) + wordmark
   ├─ Navbar.jsx          # sticky nav se scroll stavem + mobilní menu
   ├─ Hero.jsx            # hero se spotlight kurzorem a počítadly
   ├─ BrandMarquee.jsx    # nekonečný pás značek
   ├─ Marketplace.jsx     # bazar + filtr (Vše/Sportovní/Denní/Investiční)
   ├─ CarCard.jsx         # karta auta s 3D tiltem a fallbackem fotky
   ├─ ProfitCalculator.jsx# interaktivní kalkulačka zisku (ukázka PROFÍK)
   ├─ Education.jsx        # výhody akademie
   ├─ Testimonials.jsx     # reference členů
   ├─ Pricing.jsx          # 3 plány (PROFÍK zvýrazněný)
   ├─ Faq.jsx              # akordeon
   ├─ Footer.jsx           # newsletter, sítě, odkazy
   └─ Reveal.jsx           # wrapper pro scroll-reveal animaci
```

## Jak upravit obsah

Skoro vše je v `src/data/content.js` — přidání auta, plánu nebo FAQ je jeden záznam do pole.
Akcentní barvu (neon zelená `#39FF14`), tmavou paletu a stíny změníš v `tailwind.config.js`.

## Poznámka k obrázkům

Fotky aut jsou placeholdery z Unsplash. Pokud se některá nenačte, karta zobrazí stylový
gradient blok s ikonou auta (fallback v `CarCard.jsx`). Reálné fotky stačí vyměnit v `content.js`.

> Standalone single-file verze (Tailwind CDN, bez buildu) je zachovaná v `standalone.html`.
