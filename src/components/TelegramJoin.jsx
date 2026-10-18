import { Send, X } from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { telegramLink } from '../lib/telegram.js';

/**
 * Po úspěšné platbě (?checkout=success&session_id=…): výrazná výzva ke vstupu
 * do Telegram skupiny členů. Bot podle session_id ověří platbu. Leží nad vším
 * ať ji plátce nepřehlédne.
 */
export default function TelegramJoin() {
  const { justPaidSession, dismissJustPaid, authOpen } = useApp();
  // Při registraci (pay-first) je tlačítko přímo v AuthModal — lišta by zakryla formulář.
  if (!justPaidSession || authOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[140] p-3 sm:p-6" role="status">
      <div className="animate-fade-up relative mx-auto flex max-w-xl flex-col gap-3 rounded-2xl border border-accent/40 bg-ink-900 p-4 shadow-glow sm:flex-row sm:items-center sm:p-5">
        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
          <div className="font-display font-bold text-white">Platba proběhla, vítej mezi členy!</div>
          <div className="mt-0.5 text-sm text-zinc-400">Posledním krokem je vstup do uzavřené Telegram skupiny.</div>
        </div>
        <a
          href={telegramLink(justPaidSession)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink-950 shadow-glow transition hover:brightness-110"
        >
          <Send className="h-4 w-4" /> Otevřít Telegram a vstoupit do skupiny členů
        </a>
        <button onClick={dismissJustPaid} aria-label="Zavřít" className="absolute right-3 top-3 text-zinc-500 transition hover:text-white sm:static">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
