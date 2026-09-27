import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PropertyService } from '../../../properties/services/property.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AgencyProfile, Property, ReviewItem } from '../../../properties/models/property.model';
import { PropertyCardComponent } from '../../../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-agency-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PropertyCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-8" *ngIf="!loading; else loadingTemplate">
        
        <!-- En-tête Profil Agence -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" *ngIf="agency">
          <div class="h-36 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 relative">
            <div class="absolute inset-0 bg-pattern opacity-10"></div>
            <a routerLink="/properties" class="absolute top-4 left-4 text-white/90 hover:text-white text-sm font-medium flex items-center gap-1 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg transition">
              ← Retour aux annonces
            </a>
          </div>

          <div class="px-6 pb-6 pt-0 relative sm:flex sm:items-end sm:justify-between sm:space-x-5">
            <div class="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 sm:-mt-12">
              <img [src]="agency.profilePictureUrl || defaultAvatar" 
                   [alt]="agency.companyName" 
                   (error)="onImageError($event)"
                   class="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0" />
              
              <div class="mt-4 sm:mt-0 space-y-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">{{ agency.companyName }}</h1>
                  <span *ngIf="agency.verified" 
                        class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
                        title="Agence contrôlée et vérifiée par l'administration">
                    <span>✓</span> Vérifiée par SamaKeur
                  </span>
                </div>
                <p class="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                  <span>👤 Responsable : <strong>{{ agency.fullName }}</strong></span>
                  <span *ngIf="agency.address">📍 {{ agency.address }}</span>
                </p>
                <div class="flex items-center gap-3 pt-1 text-sm">
                  <div class="flex items-center text-amber-500 font-bold">
                    <span class="text-lg mr-1">★</span>
                    <span>{{ agency.averageRating > 0 ? agency.averageRating : 'Nouveau' }}</span>
                  </div>
                  <span class="text-gray-400">•</span>
                  <span class="text-gray-600">{{ agency.totalReviews }} avis</span>
                  <span class="text-gray-400">•</span>
                  <span class="text-blue-600 font-semibold">{{ activeProperties.length }} annonce(s) en ligne</span>
                </div>
              </div>
            </div>

            <!-- Boutons d'Action Directe (Appel & WhatsApp) -->
            <div class="mt-6 sm:mt-0 flex flex-wrap gap-3">
              <a [href]="getWhatsAppUrl()" target="_blank" rel="noopener noreferrer"
                 class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer">
                <span>💬</span> WhatsApp Direct
              </a>
              <a [href]="'tel:' + agency.phone"
                 class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2 cursor-pointer">
                <span>📞</span> {{ agency.phone }}
              </a>
            </div>
          </div>

          <!-- Informations Légales & Certifications -->
          <div class="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-wrap gap-6 text-xs text-gray-600">
            <span *ngIf="agency.ninea"><strong>NINEA :</strong> {{ agency.ninea }}</span>
            <span *ngIf="agency.rccm"><strong>RCCM :</strong> {{ agency.rccm }}</span>
            <span *ngIf="agency.email"><strong>Email officiel :</strong> {{ agency.email }}</span>
            <span class="text-emerald-700 font-medium">✓ Partenaire immobilier agréé au Sénégal</span>
          </div>
        </div>

        <!-- Onglets Annonces vs Avis -->
        <div class="flex border-b border-gray-200">
          <button (click)="activeTab = 'properties'" 
                  [class]="activeTab === 'properties' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-4 px-6 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer">
            <span>Biens disponibles</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-bold">{{ activeProperties.length }}</span>
          </button>
          <button (click)="activeTab = 'reviews'" 
                  [class]="activeTab === 'reviews' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-4 px-6 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer">
            <span>Notes & Avis clients</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">{{ reviews.length }}</span>
          </button>
        </div>

        <!-- Section 1 : Annonces actives de l'agence -->
        <div *ngIf="activeTab === 'properties'">
          <div *ngIf="activeProperties.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <app-property-card *ngFor="let prop of activeProperties" [property]="prop"></app-property-card>
          </div>

          <div *ngIf="activeProperties.length === 0" class="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
            <span class="text-4xl">🏢</span>
            <h3 class="text-lg font-bold text-gray-800 mt-3">Aucune annonce actuellement en ligne</h3>
            <p class="text-sm text-gray-500 mt-1">Cette agence n'a pas d'annonces actives pour le moment.</p>
          </div>
        </div>

        <!-- Section 2 : Avis clients & Dépôt d'avis -->
        <div *ngIf="activeTab === 'reviews'" class="space-y-8">
          
          <!-- Formulaire Dépôt d'Avis (Connecté vs Non Connecté) -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Évaluer l'agence {{ agency?.companyName }}</h3>
            
            <ng-container *ngIf="isLoggedIn; else loginPrompt">
              <p class="text-xs text-gray-500 mb-4">Partagez votre expérience pour éclairer les autres chercheurs de logement.</p>
              
              <!-- Étoiles -->
              <div class="flex items-center gap-2 mb-4">
                <span class="text-xs font-semibold text-gray-700">Votre note :</span>
                <div class="flex items-center gap-1">
                  <button *ngFor="let star of [1, 2, 3, 4, 5]" 
                          type="button" 
                          (click)="newRating = star"
                          class="text-3xl text-amber-400 hover:scale-110 transition cursor-pointer select-none">
                    {{ star <= newRating ? '★' : '☆' }}
                  </button>
                </div>
                <span class="text-xs font-bold text-gray-600 ml-2" *ngIf="newRating > 0">{{ newRating }} / 5</span>
              </div>

              <!-- Commentaire -->
              <textarea [(ngModel)]="newComment" rows="3" placeholder="Qualité du service, ponctualité, conformité du logement..."
                        class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"></textarea>
              
              <button (click)="submitReview()" 
                      [disabled]="newRating === 0 || !newComment.trim() || submittingReview"
                      class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer">
                {{ submittingReview ? 'Envoi en cours...' : 'Publier mon avis' }}
              </button>
            </ng-container>

            <ng-template #loginPrompt>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🔒</span>
                  <div>
                    <h4 class="text-sm font-bold text-blue-900">Compte obligatoire pour évaluer une agence</h4>
                    <p class="text-xs text-blue-700">Connectez-vous pour laisser une note certifiée et un commentaire sur cette agence.</p>
                  </div>
                </div>
                <a routerLink="/login" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shrink-0">
                  Se connecter
                </a>
              </div>
            </ng-template>
          </div>

          <!-- Liste des Avis -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <h3 class="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Avis des clients ({{ reviews.length }})</span>
              <span class="text-sm font-semibold text-amber-500" *ngIf="agency?.averageRating">
                Note globale : {{ agency.averageRating }} / 5 ★
              </span>
            </h3>

            <div class="divide-y divide-gray-100" *ngIf="reviews.length > 0; else noReviews">
              <div *ngFor="let rev of reviews" class="py-4 first:pt-0 last:pb-0 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-900 text-sm">
                    {{ rev.client?.fullName || 'Client SamaKeur' }}
                  </span>
                  <span class="text-xs text-gray-400">{{ rev.createdAt | date:'longDate' }}</span>
                </div>
                <div class="flex items-center text-amber-400 text-sm">
                  <span *ngFor="let s of [1, 2, 3, 4, 5]">{{ s <= rev.rating ? '★' : '☆' }}</span>
                  <span class="text-xs font-bold text-gray-600 ml-2">{{ rev.rating }}/5</span>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">{{ rev.comment }}</p>
              </div>
            </div>

            <ng-template #noReviews>
              <div class="text-center py-12 text-gray-400 text-sm">
                Aucun avis déposé pour le moment. Soyez le premier à évaluer cette agence !
              </div>
            </ng-template>
          </div>

        </div>

      </div>
    </div>

    <!-- Template Chargement -->
    <ng-template #loadingTemplate>
      <div class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-3 text-gray-500 text-sm font-medium">Chargement du profil de l'agence...</p>
      </div>
    </ng-template>
  `
})
export class AgencyProfilePageComponent implements OnInit {
  agency?: AgencyProfile;
  activeProperties: Property[] = [];
  reviews: ReviewItem[] = [];
  loading = true;
  activeTab: 'properties' | 'reviews' = 'properties';

  isLoggedIn = false;
  newRating = 0;
  newComment = '';
  submittingReview = false;

  readonly defaultAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadAgency(Number(id));
      } else {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/properties']);
      }
    });
  }

  loadAgency(agencyId: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.propertyService.getAgencyProfile(agencyId).subscribe({
      next: (data) => {
        this.agency = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.loadProperties(agencyId);
        this.loadReviews(agencyId);
      },
      error: () => {
        this.toastService.show('Impossible de charger le profil de cette agence.', 'error');
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/properties']);
      }
    });
  }

  loadProperties(agencyId: number): void {
    this.propertyService.getPropertiesByAgencyId(agencyId).subscribe({
      next: (props) => {
        this.activeProperties = props ? props.filter(p => !p.status || p.status === 'AVAILABLE' || p.status === 'DISPONIBLE') : [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.activeProperties = [];
        this.cdr.detectChanges();
      }
    });
  }

  loadReviews(agencyId: number): void {
    this.propertyService.getAgencyReviews(agencyId).subscribe({
      next: (revs) => {
        this.reviews = revs || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.reviews = [];
        this.cdr.detectChanges();
      }
    });
  }

  getWhatsAppUrl(): string {
    if (!this.agency?.phone) return '#';
    let clean = this.agency.phone.replace(/[^0-9]/g, '');
    if (!clean.startsWith('221') && clean.length === 9) {
      clean = '221' + clean;
    }
    const msg = encodeURIComponent(`Bonjour ${this.agency.companyName}, je vous contacte depuis la plateforme SamaKeur au sujet de vos offres immobilières.`);
    return `https://wa.me/${clean}?text=${msg}`;
  }

  submitReview(): void {
    if (!this.isLoggedIn) {
      this.toastService.show('Veuillez vous connecter pour déposer un avis.', 'error');
      this.router.navigate(['/login']);
      return;
    }
    if (this.newRating === 0 || !this.newComment.trim() || !this.agency) return;

    this.submittingReview = true;
    this.propertyService.addReview(this.agency.id, this.newRating, this.newComment.trim()).subscribe({
      next: (newRev) => {
        this.reviews.unshift(newRev);
        this.newRating = 0;
        this.newComment = '';
        this.submittingReview = false;
        this.toastService.show('Votre avis a été publié avec succès !', 'success');
        if (this.agency) {
          this.loadAgency(this.agency.id);
        }
      },
      error: () => {
        this.submittingReview = false;
        this.toastService.show("Erreur lors de l'enregistrement de votre avis.", 'error');
      }
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultAvatar;
  }
}
