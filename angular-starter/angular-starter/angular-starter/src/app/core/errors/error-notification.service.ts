import { Injectable, signal } from '@angular/core';

/**
 * Responsabilité unique : conserver le dernier message destiné à l'utilisateur.
 * Le signal exposé est en lecture seule pour empêcher les composants de le modifier.
 */
@Injectable({ providedIn: 'root' })
export class ErrorNotificationService {
  private readonly internalMessage = signal('');
  readonly message = this.internalMessage.asReadonly();

  show(message: string): void {
    this.internalMessage.set(message);
  }

  clear(): void {
    this.internalMessage.set('');
  }
}
