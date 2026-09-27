import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, RegisterPayload } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full space-y-6 bg-white p-8 rounded-2xl shadow-lg">
        
        <!-- En-tête -->
        <div class="text-center">
          <a routerLink="/" class="inline-block">
            <span class="text-3xl font-black text-blue-600">SamaKeur</span>
          </a>
          <p class="text-xs text-gray-400 mt-0.5">🇸🇳 Plateforme immobilière au Sénégal</p>
          <h2 class="mt-4 text-2xl font-extrabold text-gray-900">
            <span *ngIf="formData.role === 'ROLE_CLIENT'">Créer un compte Particulier</span>
            <span *ngIf="formData.role === 'ROLE_AGENCY'">Inscription Agence Immobilière</span>
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            <span *ngIf="formData.role === 'ROLE_CLIENT'">Trouvez facilement votre prochain logement à louer ou acheter</span>
            <span *ngIf="formData.role === 'ROLE_AGENCY'">Publiez vos annonces et développez votre clientèle</span>
          </p>
        </div>

        <!-- Sélecteur de profil d'inscription -->
        <div class="flex p-1 bg-gray-100 rounded-xl">
          <button type="button" (click)="setRole('ROLE_CLIENT')"
            [class]="formData.role === 'ROLE_CLIENT' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
            class="flex-1 py-2 text-xs sm:text-sm rounded-lg transition flex items-center justify-center gap-2 cursor-pointer">
            <span>👤</span>
            <span>Chercheur de logement</span>
          </button>
          <button type="button" (click)="setRole('ROLE_AGENCY')"
            [class]="formData.role === 'ROLE_AGENCY' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-500 hover:text-gray-700 font-medium'"
            class="flex-1 py-2 text-xs sm:text-sm rounded-lg transition flex items-center justify-center gap-2 cursor-pointer">
            <span>🏢</span>
            <span>Agence Immobilière</span>
          </button>
        </div>

        <form class="space-y-4" (ngSubmit)="onSubmit()">
          <!-- Message d'erreur -->
          <div *ngIf="errorMessage" class="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-2">
            <span class="shrink-0">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Message de succès avec confirmation d'email -->
          <div *ngIf="successMessage" class="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200 flex items-start gap-3 animate-fade-in shadow-xs">
            <span class="text-xl shrink-0">🎉</span>
            <div>
              <p class="font-bold">{{ successMessage }}</p>
              <p class="text-xs text-emerald-700 mt-1">
                📧 Un e-mail de bienvenue vous a été envoyé avec vos informations d'accès. Redirection en cours...
              </p>
            </div>
          </div>

          <!-- Informations Personnelles (Communes) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Nom complet *</label>
              <input type="text" [(ngModel)]="formData.fullName" name="fullName" required
                placeholder="Ex: Fatou Sow"
                class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Téléphone *</label>
              <input type="tel" [(ngModel)]="formData.phone" name="phone" required
                placeholder="Ex: +221 77 000 00 00"
                class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">Adresse Email *</label>
            <input type="email" [(ngModel)]="formData.email" name="email" required
              placeholder="Ex: votreemail@gmail.com"
              class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase">Mot de passe *</label>
            <input type="password" [(ngModel)]="formData.password" name="password" required
              placeholder="Minimum 8 caractères"
              class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
          </div>

          <!-- Informations Professionnelles (affichées UNIQUEMENT si profil Agence) -->
          <div *ngIf="formData.role === 'ROLE_AGENCY'" class="p-5 bg-blue-50/60 rounded-2xl space-y-4 border border-blue-100">
            <h3 class="text-xs font-black uppercase tracking-wider text-blue-900 border-b border-blue-200 pb-2 flex items-center gap-2">
              <span>📋</span> Informations Professionnelles Agence
            </h3>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Nom de l'Agence / Société *</label>
              <input type="text" [(ngModel)]="formData.companyName" name="companyName" required
                placeholder="Ex: Dakar Immo SARL"
                class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">NINEA</label>
                <input type="text" [(ngModel)]="formData.ninea" name="ninea"
                  placeholder="Numéro NINEA"
                  class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">RCCM</label>
                <input type="text" [(ngModel)]="formData.rccm" name="rccm"
                  placeholder="Numéro RCCM"
                  class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white">
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Adresse Physique</label>
              <input type="text" [(ngModel)]="formData.address" name="address"
                placeholder="Ex: Almadies, Dakar"
                class="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white">
            </div>

            <div class="border-t border-blue-200/80 pt-4 space-y-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Logo / Photo de profil Agence *</label>
                <input type="file" (change)="onProfilePictureSelected($event)" accept="image/*"
                  class="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                <p *ngIf="selectedProfilePicture" class="text-xs text-emerald-600 mt-1 font-semibold">✓ {{ selectedProfilePicture.name }}</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Pièce d'identité CNI ou Passeport *</label>
                <input type="file" (change)="onKycDocumentSelected($event)" accept="image/*,.pdf"
                  class="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer">
                <p *ngIf="selectedKycDocument" class="text-xs text-emerald-600 mt-1 font-semibold">✓ {{ selectedKycDocument.name }}</p>
              </div>
            </div>
          </div>

          <!-- Bouton de soumission -->
          <button type="submit" [disabled]="loading || !!successMessage"
            class="w-full py-3 px-4 rounded-xl shadow-xs text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
            <span *ngIf="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {{ loading ? "Création du compte..." : (formData.role === 'ROLE_AGENCY' ? "Créer mon compte Agence" : "Créer mon compte Client") }}
          </button>

          <!-- Pied de formulaire avec switch et lien de connexion -->
          <div class="space-y-2 text-center text-sm pt-2">
            <div>
              <span class="text-gray-600">Déjà un compte ? </span>
              <a [routerLink]="['/login']" [queryParams]="{ portal: formData.role === 'ROLE_AGENCY' ? 'agency' : 'client' }"
                 class="font-semibold text-blue-600 hover:text-blue-500">
                Se connecter
              </a>
            </div>

            <div class="pt-2 border-t border-gray-100">
              <button *ngIf="formData.role === 'ROLE_CLIENT'" type="button" (click)="setRole('ROLE_AGENCY')"
                class="text-xs font-medium text-slate-500 hover:text-blue-600 transition cursor-pointer">
                Vous représentez une agence immobilière ? <u>Inscrivez votre agence ici</u>
              </button>
              <button *ngIf="formData.role === 'ROLE_AGENCY'" type="button" (click)="setRole('ROLE_CLIENT')"
                class="text-xs font-medium text-slate-500 hover:text-emerald-600 transition cursor-pointer">
                Vous êtes un particulier cherchant un logement ? <u>Inscrivez-vous en tant que client</u>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterPageComponent implements OnInit {
  formData: any = {
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'ROLE_CLIENT',
    companyName: '',
    ninea: '',
    rccm: '',
    address: ''
  };

  selectedProfilePicture: File | null = null;
  selectedKycDocument: File | null = null;

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const r = params['role'] || params['portal'];
      if (r === 'agency' || r === 'ROLE_AGENCY') {
        this.formData.role = 'ROLE_AGENCY';
      } else {
        this.formData.role = 'ROLE_CLIENT';
      }
      this.cdr.detectChanges();
    });
  }

  setRole(role: 'ROLE_CLIENT' | 'ROLE_AGENCY'): void {
    this.formData.role = role;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProfilePicture = input.files[0];
      this.cdr.detectChanges();
    }
  }

  onKycDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedKycDocument = input.files[0];
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    if (this.formData.role === 'ROLE_AGENCY') {
      if (!this.formData.companyName || this.formData.companyName.trim() === '') {
        this.errorMessage = "Le nom de l'agence ou de la société est obligatoire.";
        this.cdr.detectChanges();
        return;
      }
      if (!this.selectedProfilePicture || !this.selectedKycDocument) {
        this.errorMessage = "La photo/logo de profil et la pièce d'identité (CNI/Passeport) sont requises pour les agences.";
        this.cdr.detectChanges();
        return;
      }
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    const payload = new FormData();
    payload.append('email', this.formData.email);
    payload.append('password', this.formData.password);
    payload.append('fullName', this.formData.fullName);
    payload.append('phone', this.formData.phone || '');
    payload.append('role', this.formData.role);

    if (this.formData.role === 'ROLE_AGENCY') {
      payload.append('companyName', this.formData.companyName || '');
      payload.append('ninea', this.formData.ninea || '');
      payload.append('rccm', this.formData.rccm || '');
      payload.append('address', this.formData.address || '');

      if (this.selectedProfilePicture) {
        payload.append('profilePicture', this.selectedProfilePicture);
      }
      if (this.selectedKycDocument) {
        payload.append('kycDocument', this.selectedKycDocument);
      }
    }

    this.authService.register(payload as any).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = "Votre compte a été créé avec succès !";
        this.cdr.detectChanges();

        setTimeout(() => {
          if (res.role === 'ROLE_AGENCY') {
            this.router.navigate(['/agency/dashboard']);
          } else {
            this.router.navigate(['/properties']);
          }
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || "Erreur lors de l'inscription. Vérifiez vos informations.";
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}