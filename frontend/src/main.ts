// ─── Polyfill pour sockjs-client ─────────────────────────────────────────────
// sockjs-client utilise l'objet `global` de Node.js qui n'existe pas dans le
// navigateur. On l'aliase sur `window` pour éviter le ReferenceError.
(window as any)['global'] = window;

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
