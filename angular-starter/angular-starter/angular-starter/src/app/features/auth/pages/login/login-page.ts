import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        
        <!-- En-tête -->
        <div class="text-center">
          <a routerLink="/" class="inline-block">
            <span class="text-3xl font-black text-blue-600">SamaKeur</span>
          </a>
          <p class="text-xs text-gray-400 mt-0.5">🇸🇳 Plateforme immobilière au Sénégal</p>
          <h2 class="mt-4 text-2xl font-extrabold text-gray-900">
            <span *ngIf="selectedPortal === 'client'">Connexion Espace Client</span>
            <span *ngIf="selectedPortal === 'agency'">Connexion Agence Immobilière</span>
            <span *ngIf="selectedPortal === 'admin'">Connexion Administration</span>
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            <span *ngIf="selectedPortal === 'client'">Accédez à vos annonces favorites et vos avis</span>
            <span *ngIf="selectedPortal === 'agency'">Gérez vos biens immobiliers et vos contacts clients</span>
            <span *ngIf="selectedPortal === 'admin'">Supervision et gestion globale de SamaKeur</span>
          </p>
        </div>

        <!-- Sélecteur d'espace / profil (Client / Agence / Admin) -->
        <div class="flex p-1 bg-gray-100 rounded-xl">
          <button type="button" (click)="setPortal('client')"
            [class]="selectedPortal === 'client' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
            class="flex-1 py-2 text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
            <span>👤</span>
            <span>Client</span>
          </button>
          <button type="button" (click)="setPortal('agency')"
            [class]="selectedPortal === 'agency' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
            class="flex-1 py-2 text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🏢</span>
            <span>Agence</span>
          </button>
          <button type="button" (click)="setPortal('admin')"
            [class]="selectedPortal === 'admin' ? 'bg-white text-purple-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
            class="flex-1 py-2 text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
            <span>🛡️</span>
            <span>Admin</span>
          </button>
        </div>

        <form class="space-y-4" (ngSubmit)="onSubmit()">
          <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-2">
            <span class="shrink-0">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Adresse Email</label>
              <input type="email" [(ngModel)]="credentials.email" name="email" required
                placeholder="votreemail@gmail.com"
                class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Mot de passe</label>
              <input type="password" [(ngModel)]="credentials.password" name="password" required
                placeholder="Votre mot de passe"
                class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            </div>
          </div>

          <button type="submit" [disabled]="loading"
            class="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition cursor-pointer">
            <span *ngIf="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>

          <div class="text-center text-sm">
            <span class="text-gray-600">Pas encore de compte ? </span>
            <a [routerLink]="['/register']" [queryParams]="{ role: selectedPortal === 'agency' ? 'agency' : 'client' }"
               class="font-semibold text-blue-600 hover:text-blue-500">
              S'inscrire gratuitement
            </a>
          </div>

          <!-- Section Démo Rapide selon le Profil Sélectionné -->
          <div class="mt-6 pt-5 border-t border-gray-100">
            <!-- CAS 1 : Si Client -> Voit UNIQUEMENT le bouton Client -->
            <div *ngIf="selectedPortal === 'client'" class="space-y-2">
              <p class="text-[11px] font-bold uppercase tracking-wider text-emerald-700 text-center">
                👤 Accès rapide Démo - Compte Client
              </p>
              <button type="button" (click)="fillCredentials('client')"
                class="w-full py-2.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-center transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
                <span>👤</span>
                <span>Remplir les identifiants Client (chercheur&#64;gmail.com)</span>
              </button>
            </div>

            <!-- CAS 2 : Si Agence -> Voit UNIQUEMENT le bouton Agence -->
            <div *ngIf="selectedPortal === 'agency'" class="space-y-2">
              <p class="text-[11px] font-bold uppercase tracking-wider text-blue-700 text-center">
                🏢 Accès rapide Démo - Compte Agence Immobilière
              </p>
              <button type="button" (click)="fillCredentials('agency')"
                class="w-full py-2.5 px-3 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 text-center transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
                <span>🏢</span>
                <span>Remplir les identifiants Agence (dakarimmo&#64;samakeur.sn)</span>
              </button>
            </div>

            <!-- CAS 3 : L'Administrateur voit les TROIS en même temps -->
            <div *ngIf="selectedPortal === 'admin'" class="space-y-2">
              <p class="text-[11px] font-bold uppercase tracking-wider text-purple-700 text-center">
                🛡️ Accès démo Administrateur - Tous les profils
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button type="button" (click)="fillCredentials('client')"
                  class="px-2 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-center transition flex flex-col items-center gap-1 cursor-pointer">
                  <span class="text-base">👤</span>
                  <span>Client</span>
                </button>
                <button type="button" (click)="fillCredentials('agency')"
                  class="px-2 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 text-center transition flex flex-col items-center gap-1 cursor-pointer">
                  <span class="text-base">🏢</span>
                  <span>Agence</span>
                </button>
                <button type="button" (click)="fillCredentials('admin')"
                  class="px-2 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 text-center transition flex flex-col items-center gap-1 cursor-pointer">
                  <span class="text-base">🛡️</span>
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <p *ngIf="demoHint" class="text-xs text-center text-gray-500 mt-2 italic">{{ demoHint }}</p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginPageComponent implements OnInit {
  credentials = { email: '', password: '' };
  errorMessage = '';
  loading = false;
  demoHint = '';
  selectedPortal: 'client' | 'agency' | 'admin' = 'client';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const p = params['portal'] || params['role'];
      if (p === 'agency' || p === 'ROLE_AGENCY') {
        this.selectedPortal = 'agency';
      } else if (p === 'admin' || p === 'ROLE_ADMIN') {
        this.selectedPortal = 'admin';
      } else {
        this.selectedPortal = 'client';
      }
      this.cdr.detectChanges();
    });
  }

  setPortal(portal: 'client' | 'agency' | 'admin'): void {
    this.selectedPortal = portal;
    this.demoHint = '';
    this.errorMessage = '';
    this.credentials = { email: '', password: '' };
    this.cdr.detectChanges();
  }

  fillCredentials(role: 'client' | 'agency' | 'admin'): void {
    if (role === 'client') {
      this.credentials = { email: 'chercheur@gmail.com', password: 'Client@123' };
      this.demoHint = 'Compte client : chercheur@gmail.com';
    } else if (role === 'agency') {
      this.credentials = { email: 'dakarimmo@samakeur.sn', password: 'Agence@123' };
      this.demoHint = 'Agence : Dakar Immo Prestige SARL';
    } else if (role === 'admin') {
      this.credentials = { email: 'admin@samakeur.sn', password: 'Admin@123' };
      this.demoHint = 'Admin système : Mamadou Ndiaye';
    }
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastService.show(
          'Merci de vous être connecté à SamaKeur ! Vous êtes les bienvenus.',
          'success',
          5000
        );
        this.cdr.detectChanges();
        if (res.role === 'ROLE_ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else if (res.role === 'ROLE_AGENCY') {
          this.router.navigate(['/agency/dashboard']);
        } else {
          this.router.navigate(['/properties']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Identifiants invalides. Vérifiez votre email et mot de passe.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}