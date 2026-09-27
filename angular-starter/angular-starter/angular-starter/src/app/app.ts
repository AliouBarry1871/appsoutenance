import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ErrorBanner } from './shared/components/error-banner/error-banner';
import { ErrorNotificationService } from './core/errors/error-notification.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ErrorBanner, ToastComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <app-navbar></app-navbar>

      <!-- Bannière d'erreur globale (intercepteur HTTP) -->
      @if (notifications.message()) {
        <app-error-banner [message]="notifications.message()" />
      }

      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Système de notifications toast global -->
      <app-toast></app-toast>

      <app-footer></app-footer>
    </div>
  `
})
export class App {
  constructor(readonly notifications: ErrorNotificationService) {}
}