import { lazy, Suspense, useEffect, useState } from 'react';

// Celá 3D scéna je samostatný chunk → mimo initial bundle
const Scene = lazy(() => import('./Scene.jsx'));

/**
 * Načte 3D globus pouze:
 *  - na desktopu (min-width 1024 + myš)
 *  - když uživatel nemá zapnuté „reduced motion"
 *  - až po načtení stránky (requestIdleCallback) → 0 dopadu na LCP/INP
 */
export default function Hero3D() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ok =
      window.matchMedia('(min-width: 1024px) and (hover: hover)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ok) return;

    const cb = () => setShow(true);
    const id = 'requestIdleCallback' in window
      ? window.requestIdleCallback(cb, { timeout: 2000 })
      : setTimeout(cb, 900);
    return () => ('cancelIdleCallback' in window ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  if (!show) return null;
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
}
