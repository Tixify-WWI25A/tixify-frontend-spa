// Mit KI erstellt (Gemini, KI-Log Nr. 17, 13.10.), vom Team getestet und bewertet.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
