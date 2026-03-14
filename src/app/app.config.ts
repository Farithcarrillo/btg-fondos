import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';

/**
 * Configuración Angular 21:
 * - provideZonelessChangeDetection() → sin zone.js (Angular 21 default)
 * - withViewTransitions() → transiciones suaves entre rutas
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions())
  ]
};