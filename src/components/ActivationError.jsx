import { useState } from 'react';
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { useApp } from '../AppContext.jsx';

/**
 * Platba proběhla, ale zápis členství k účtu selhal (síť / backend). Přístup
 * nedáváme „na důvěru" z prohlížeče — nabídneme zopakovat ověřenou aktivaci.
 */
export default function ActivationError() {
  const { activationError, activateAfterCheckout } = useApp();
  const [busy, setBusy] = useState(false);
  if (!activationError) return null;

  const retry = async () => { setBusy(true); await activateAfterCheckout(activationError); setBusy(false); };

  return (
    <div className="fixed inset-x-0 top-0 z-[140] p-3 sm:p-6" role="alert">
      <div className="mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-red-500/40 bg-ink-900 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-2 text-sm text-zinc-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <span>Platba proběhla, ale členství se nepodařilo aktivovat. Zkus to znovu — pokud to nepůjde, napiš nám a aktivujeme ho ručně.</span>
        </div>
        <button onClick={retry} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:brightness-110 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />} Zkusit znovu
        </button>
      </div>
    </div>
  );
}
