import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../errors/api-error.model';
import { ErrorNotificationService } from '../errors/error-notification.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Intercepte toutes les erreurs HTTP en un seul endroit.
 * Les services data-access restent concentrés sur les données (SRP).
 */
export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(ErrorNotificationService);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(request.clone({ setHeaders: { Accept: 'application/json' } })).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = request.url.includes('/auth/login') || request.url.includes('/auth/register');

      // Si le token a expiré ou que l'accès est refusé sur une ressource protégée
      if ((error.status === 401 || error.status === 403) && !isAuthEndpoint) {
        if (authService.getToken()) {
          authService.logout();
          toastService.show('Votre session a expiré. Veuillez vous reconnecter.', 'warning');
          router.navigate(['/login']);
        }
      }

      const apiError = error.error as Partial<ApiError> | null;
      const message = apiError?.message
        ?? (error.status === 0
          ? 'Serveur indisponible. Vérifiez que le backend est démarré.'
          : (error.status === 401 || error.status === 403) && !isAuthEndpoint
            ? 'Session expirée ou accès non autorisé.'
            : 'Une erreur inattendue est survenue.');

      notifications.show(message);
      // On propage l'erreur : le composant peut aussi réagir localement si nécessaire.
      return throwError(() => error);
    })
  );
};
