import { useEffect, useState } from 'react';
import { dealsApi } from '../lib/dealsApi.js';

/** Malý async hook (bez react-query) — drží poslední data při refetchi, ať tabulka „nezabliká". */
function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, isLoading: true, isError: false });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ data: s.data, isLoading: true, isError: false }));
    fn()
      .then((data) => { if (alive) setState({ data, isLoading: false, isError: false }); })
      .catch(() => { if (alive) setState({ data: null, isLoading: false, isError: true }); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function useUndervalued(params) {
  return useAsync(() => dealsApi.undervalued(params), [JSON.stringify(params)]);
}

export function useMobiledeManufacturers() {
  return useAsync(() => dealsApi.mobiledeManufacturers(), []);
}

export function useMobiledeModels(manufacturer) {
  return useAsync(() => dealsApi.mobiledeModels(manufacturer), [manufacturer]);
}
