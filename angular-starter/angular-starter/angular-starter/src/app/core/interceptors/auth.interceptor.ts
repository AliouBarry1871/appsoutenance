import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne JAMAIS attacher de token sur les routes d'authentification publiques (login / register)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // S'assure que le token existe et n'est pas vide
  if (token && token !== 'undefined' && token !== 'null') {
    // Si le token est expiré, on nettoie la session et on n'attache pas un token mort
    if (authService.isTokenExpired(token)) {
      authService.logout();
      return next(req);
    }

    // Nettoie le token au cas où il a été sauvegardé avec des guillemets JSON.stringify
    const cleanToken = token.replace(/^"(.*)"$/, '$1');

    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cleanToken}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};