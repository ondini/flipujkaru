/* Kanonické hodnoty z API algoritmu (FKback sauto/vocabulary.py) → české
   popisky pro filtry a detail v „Doporučené flipy". */
export const FUEL_LABELS = {
  petrol: 'Benzín',
  diesel: 'Nafta',
  hybrid: 'Hybrid',
  electric: 'Elektro',
  lpg_cng: 'LPG / CNG',
  other: 'Jiné',
};

export const GEARBOX_LABELS = {
  manual: 'Manuální',
  automatic: 'Automatická',
};

export const BODY_LABELS = {
  suv: 'SUV / terénní',
  estate: 'Kombi',
  sedan_hatchback: 'Sedan / hatchback',
  coupe: 'Kupé',
  convertible: 'Kabriolet',
  van: 'MPV / van',
};

/** Popisek pro kanonickou hodnotu (neznámou vrátí beze změny). */
export const dealLabel = (map, value) => (value ? map[value] || value : null);
