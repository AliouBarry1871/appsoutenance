import { describe, expect, it } from 'vitest';
import { ErrorNotificationService } from './error-notification.service';

/**
 * Test unitaire sans TestBed : la classe n'a aucune dépendance à injecter.
 * Utiliser l'outil le plus simple rend les tests rapides et lisibles.
 */
describe('ErrorNotificationService', () => {
  it('publie puis efface un message', () => {
    const service = new ErrorNotificationService();

    service.show('Erreur de démonstration');
    expect(service.message()).toBe('Erreur de démonstration');

    service.clear();
    expect(service.message()).toBe('');
  });
});
