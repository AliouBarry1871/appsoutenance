import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Composant de présentation réutilisable.
 * Il reçoit ses données par input et ne dépend d'aucun service métier.
 */
@Component({
  selector: 'app-error-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="error" role="alert">{{ message() }}</p>`
})
export class ErrorBanner {
  readonly message = input.required<string>();
}
