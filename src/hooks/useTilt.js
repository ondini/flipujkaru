import { useRef } from 'react';

/**
 * 3D náklon prvku podle pozice kurzoru.
 * Prvek dostane perspektivu + rotaci; potomci s translateZ tak „vyskočí" do hloubky.
 * Vrací ref + handlery k navěšení na element (přidej třídu `tilt-3d`).
 * Na dotykových zařízeních (bez hoveru) se efekt vypne.
 */
export function useTilt({ max = 8, scale = 1, perspective = 900 } = {}) {
  const ref = useRef(null);

  const onPointerMove = (e) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform =
      `perspective(${perspective}px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale(${scale})`;
  };

  const onPointerLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  return { ref, onPointerMove, onPointerLeave };
}
