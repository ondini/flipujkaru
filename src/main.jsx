import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Self-hosted fonty (latin + latin-ext pro češtinu, font-display: swap) — bez Google Fonts
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/space-grotesk/wght.css';
import './index.css';
import { captureTg } from './lib/telegram.js';

// ?tg=… z odkazu (Telegram) → uložit dřív, než App vyčistí URL.
captureTg();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
