import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { API_URL } from './core/config/api.config';
import { apiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Composition root : toutes les dépendances globales sont déclarées ici.
 * - authInterceptor : attache le token JWT à chaque requête sortante.
 * - apiErrorInterceptor : centralise la gestion des erreurs HTTP.
 * Une URL différente peut être injectée en test sans modifier les services.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, apiErrorInterceptor])),
    { provide: API_URL, useValue: '/api' }
  ]
};

