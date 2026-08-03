import { useEffect, useRef, useState } from 'react';

/**
 * Animované počítadlo, které se spustí, až je prvek ve viewportu.
 * @param {number} end    cílová hodnota
 * @param {object} opts    { decimals, duration }
 * @returns [ref, displayValue]
 */
export function useCountUp(end, { decimals = 0, duration = 1400 } = {}) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min((t - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            setValue(end * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  const formatted = decimals
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('cs-CZ');

  return [ref, formatted];
}
