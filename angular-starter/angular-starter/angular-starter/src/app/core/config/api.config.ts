import { InjectionToken } from '@angular/core';

/**
 * InjectionToken évite d'écrire l'URL en dur dans les services.
 * DIP : la couche data-access dépend d'une configuration injectable.
 */
export const API_URL = new InjectionToken<string>('API_URL');

/**
 * Objet de configuration statique utilisable sans injection DI.
 * Centralise l'URL de base de l'API backend SamaKeur.
 */
export const API_CONFIG = {
  baseUrl: '/api'
} as const;
