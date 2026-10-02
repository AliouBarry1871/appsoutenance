import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { PropertyService } from '../../services/property.service';
import { Property, ReviewItem } from '../../models/property.model';
import { AuthService } from '../../../../core/services/auth.service';
import { API_CONFIG } from '@core/config/api.config';
import { ToastService } from '@core/services/toast.service';
import { FormatEnumPipe } from '@shared/pipes/format-enum.pipe';
import { getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl, getGoogleMapsEmbedUrl } from '../../../../core/constants/senegal-locations.constants';

type ImageType = string | { imageUrl?: string; url?: string } | null;

@Component({
  selector: 'app-property-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FormatEnumPipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" *ngIf="!loading; else loadingTemplate">
      <div class="max-w-6xl mx-auto space-y-8" *ngIf="property; else errorTemplate">
        
        <!-- Bouton Retour & Actions rapides -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <a routerLink="/properties" class="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
            ← Retour à toutes les annonces
          </a>
          
          <div class="flex items-center gap-2.5 flex-wrap">
            <!-- Bouton Localisation & Guidage GPS -->
            <a [href]="getDirectionsUrl()" target="_blank" rel="noopener noreferrer"
               class="px-4 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer">
              <span>📍</span> Localisation & Guidage
            </a>

            <!-- Bouton Réserver ce bien (si disponible) -->
            <button *ngIf="isPropertyAvailable()" 
                    (click)="openReserveModal()"
                    class="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer">
              <span>🏷️</span> Réserver
            </button>
            <span *ngIf="!isPropertyAvailable()" 
                  class="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-100 rounded-xl border border-amber-300 flex items-center gap-1.5">
              <span>🔒</span> Bien réservé
            </span>

            <!-- Bouton Signaler -->
            <button (click)="openReportModal = true"
                    class="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 bg-white border border-gray-200 rounded-xl shadow-sm transition hover:bg-red-50 cursor-pointer flex items-center gap-1.5">
              <span>⚠️</span> Signaler ce bien
            </button>

            <!-- Bouton Favori (avec vérification de compte) -->
            <button (click)="toggleFavorite()" 
                    class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition cursor-pointer">
              <span class="text-xl" [class.text-red-500]="isFavorite">{{ isFavorite ? '❤️' : '🤍' }}</span>
              <span class="text-sm font-semibold text-gray-700">{{ isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris' }}</span>
            </button>
          </div>
        </div>

        <!-- Header Titre & Prix -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 uppercase">
                {{ property.category | formatEnum }}
              </span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 uppercase">
                {{ (property.transactionType || property.type) | formatEnum }}
              </span>
              <span *ngIf="property.status" class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase">
                {{ property.status | formatEnum }}
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-gray-900">{{ property.title }}</h1>
            <div class="mt-1.5">
              <p class="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <span class="text-rose-500">📍</span>
                <span>{{ property.address ? property.address + ', ' : '' }}{{ property.zone ? property.zone + ', ' : '' }}{{ property.city }} (Sénégal)</span>
              </p>
            </div>
          </div>

          <div class="text-left md:text-right">
            <span class="text-3xl font-black text-blue-600">{{ property.price | number }} FCFA</span>
            <span *ngIf="(property.transactionType || property.type) === 'LOCATION'" class="text-sm text-gray-500">/mois</span>
            <div *ngIf="property.depositPrice" class="text-xs text-gray-400 mt-1">
              Caution : {{ property.depositPrice | number }} FCFA
            </div>
          </div>
        </div>

        <!-- Galerie d'Images -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div [class.md:col-span-2]="property.images && property.images.length > 1" 
               [class.md:col-span-3]="!property.images || property.images.length <= 1" 
               class="h-80 sm:h-96 bg-gray-200 rounded-2xl overflow-hidden shadow-sm relative group">
            <img [src]="formatImageUrl(selectedImage || (property.images && property.images.length > 0 ? property.images[0] : null))" 
                 [alt]="property.title" 
                 (error)="onImageError($event)"
                 class="w-full h-full object-cover transition-all duration-300">
            <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg">
              📷 {{ (property.images && property.images.length > 0) ? property.images.length : 1 }} photo(s)
            </div>
          </div>
          <div *ngIf="property.images && property.images.length > 1" class="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
            <img *ngFor="let img of property.images" 
                 [src]="formatImageUrl(img)" 
                 (click)="selectedImage = img"
                 (error)="onImageError($event)"
                 class="w-24 h-24 md:w-full md:h-28 object-cover rounded-xl cursor-pointer border-2 hover:border-blue-600 transition"
                 [class.border-blue-600]="getRawUrl(selectedImage) === getRawUrl(img)"
                 [class.border-transparent]="getRawUrl(selectedImage) !== getRawUrl(img)">
          </div>
        </div>

        <!-- Contenu Principal & Sidebar Contact Agence -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 space-y-6">
            <!-- Description -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 class="text-lg font-bold text-gray-900">Description du bien</h2>
              <p class="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {{ property.description }}
              </p>
            </div>

            <!-- Équipements / Caractéristiques -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 class="text-lg font-bold text-gray-900">Caractéristiques & Commodités</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                <div *ngIf="property.rooms" class="flex items-center gap-2">
                  <span class="text-blue-600 font-bold">🛏️</span> {{ property.rooms }} pièce(s)
                </div>
                <div *ngIf="property.surface || property.area" class="flex items-center gap-2">
                  <span class="text-blue-600 font-bold">📐</span> {{ property.surface || property.area }} m²
                </div>
                <div *ngIf="property.hasAirConditioning" class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> Climatisation
                </div>
                <div *ngIf="property.hasParking" class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> Parking privé
                </div>
                <div *ngIf="property.hasBalcony" class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> Balcon
                </div>
                <div *ngIf="property.hasTerrace" class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> Terrasse
                </div>
              </div>
            </div>

            <!-- Section Localisation Exacte & Guidage GPS -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span class="text-xl">📍</span> Localisation exacte & Itinéraire
                  </h2>
                  <p class="text-xs text-gray-500 mt-0.5">
                    Guidage pas-à-pas depuis votre position actuelle jusqu'à la maison
                  </p>
                </div>
                
                <a [href]="getDirectionsUrl()" target="_blank" rel="noopener noreferrer"
                   class="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer">
                  <span>🚗</span> Démarrer l'itinéraire GPS (Google Maps)
                </a>
              </div>

              <!-- Détail de l'adresse enregistrée lors de la publication -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Ville</span>
                  <strong class="text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                    <span>🏙️</span> {{ property.city }}
                  </strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Quartier / Zone</span>
                  <strong class="text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                    <span>📍</span> {{ property.zone || 'Non précisé' }}
                  </strong>
                </div>
                <div>
                  <span class="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Adresse / Rue</span>
                  <strong class="text-slate-900 text-sm flex items-center gap-1 mt-0.5">
                    <span>🛣️</span> {{ property.address || 'Adresse complète' }}
                  </strong>
                </div>
              </div>

              <!-- Carte Interactive Intégrée -->
              <div class="h-72 w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative shadow-inner">
                <iframe [src]="getSafeMapUrl()" 
                        width="100%" 
                        height="100%" 
                        style="border:0;" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>

              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
                <p class="text-gray-500 flex items-center gap-1.5">
                  <span>🧭</span>
                  <span>L'itinéraire calcule automatiquement le trajet le plus rapide (voiture, marche, transport).</span>
                </p>
                <div class="flex items-center gap-2">
                  <button type="button" (click)="copyAddress()" 
                          class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition cursor-pointer">
                    📋 Copier l'adresse
                  </button>
                  <a [href]="getSearchMapUrl()" target="_blank" rel="noopener noreferrer"
                     class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition">
                    Ouvrir dans Maps →
                  </a>
                </div>
              </div>
            </div>

            <!-- Section Avis & Évaluations de l'Agence Partenaire -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-900">Avis clients sur l'agence</h3>
                <a *ngIf="getAgencyId()" [routerLink]="['/agencies', getAgencyId()]" class="text-xs text-blue-600 font-semibold hover:underline">
                  Voir tous les avis →
                </a>
              </div>
              
              <!-- Formulaire de dépôt d'avis (Connecté vs Non connecté) -->
              <div class="bg-gray-50 p-5 rounded-2xl space-y-3 border border-gray-100">
                <ng-container *ngIf="isLoggedIn; else loginToReview">
                  <p class="text-xs font-bold text-gray-700 uppercase">Laisser un avis sur cette agence</p>
                  <div class="flex items-center gap-2">
                    <button *ngFor="let star of [1, 2, 3, 4, 5]" 
                            type="button"
                            (click)="newRating = star"
                            class="text-2xl text-amber-400 hover:scale-110 transition cursor-pointer select-none">
                      {{ star <= newRating ? '★' : '☆' }}
                    </button>
                    <span class="text-xs font-bold text-gray-600 ml-2" *ngIf="newRating > 0">{{ newRating }} / 5</span>
                  </div>
                  <textarea [(ngModel)]="newComment" placeholder="Votre expérience avec cette agence..." rows="2"
                            class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"></textarea>
                  <button (click)="submitReview()" [disabled]="!newRating || !newComment.trim()"
                          class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
                    Publier l'avis
                  </button>
                </ng-container>

                <ng-template #loginToReview>
                  <div class="flex items-center justify-between gap-3 text-xs">
                    <div class="flex items-center gap-2 text-gray-600">
                      <span>🔒</span>
                      <span>Seuls les clients connectés peuvent évaluer les agences.</span>
                    </div>
                    <a routerLink="/login" class="text-blue-600 font-bold hover:underline">
                      Se connecter
                    </a>
                  </div>
                </ng-template>
              </div>

              <!-- Liste des avis récents -->
              <div class="space-y-4 divide-y divide-gray-100">
                <div *ngFor="let rev of agencyReviews" class="pt-3 first:pt-0 space-y-1">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-gray-900">{{ rev.client?.fullName || 'Client certifié' }}</span>
                    <span class="text-gray-400">{{ rev.createdAt | date:'shortDate' }}</span>
                  </div>
                  <div class="text-amber-400 text-xs">
                    <span *ngFor="let s of [1, 2, 3, 4, 5]">{{ s <= rev.rating ? '★' : '☆' }}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-600">{{ rev.comment }}</p>
                </div>
                <p *ngIf="agencyReviews.length === 0" class="text-xs text-gray-400 italic">Aucun avis déposé pour le moment.</p>
              </div>
            </div>
          </div>

          <!-- Colonne Droite : Coordonnées & Contact Direct Agence -->
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5 sticky top-28">
              
              <div>
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Proposé par l'agence</span>
                <div class="flex items-center gap-3 mt-2">
                  <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg overflow-hidden shrink-0">
                    <img *ngIf="getAgencyProfilePic() && !agencyPicFailed" 
                         [src]="formatImageUrl(getAgencyProfilePic())" 
                         [alt]="getAgencyName()" 
                         (error)="onAgencyPicError($event)"
                         class="w-full h-full object-cover" />
                    <span *ngIf="!getAgencyProfilePic() || agencyPicFailed">{{ getAgencyName().charAt(0) }}</span>
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5">
                      <h3 class="font-bold text-gray-900 text-base">{{ getAgencyName() }}</h3>
                      <span *ngIf="isAgencyVerified()" class="text-blue-600 font-bold text-sm" title="Agence vérifiée">✓</span>
                    </div>
                    <a *ngIf="getAgencyId()" [routerLink]="['/agencies', getAgencyId()]" 
                       class="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 mt-0.5">
                      Voir le profil de l'agence →
                    </a>
                  </div>
                </div>
              </div>

              <!-- Coordonnées certifiées -->
              <div class="border-t border-gray-100 pt-4 space-y-3 text-xs">
                <div>
                  <span class="text-gray-400 font-medium">Téléphone & WhatsApp direct</span>
                  <p class="text-sm font-bold text-gray-900 mt-0.5">{{ getAgencyPhone() }}</p>
                </div>
                <div *ngIf="getAgencyEmail()">
                  <span class="text-gray-400 font-medium">Email professionnel</span>
                  <p class="text-xs font-semibold text-gray-700 mt-0.5">{{ getAgencyEmail() }}</p>
                </div>
                <div *ngIf="getAgencyAddress()">
                  <span class="text-gray-400 font-medium">Adresse physique</span>
                  <p class="text-xs text-gray-600 mt-0.5">{{ getAgencyAddress() }}</p>
                </div>
              </div>

              <!-- Boutons de Contact Direct avec l'Agence -->
              <div class="space-y-2.5 pt-2">
                <!-- Bouton WhatsApp avec message pré-rempli -->
                <a [href]="getWhatsAppUrl()" target="_blank" rel="noopener noreferrer"
                   class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2">
                  <span>💬</span> Discuter sur WhatsApp
                </a>

                <!-- Bouton Appel Téléphonique -->
                <a [href]="'tel:' + getAgencyPhone()" 
                   class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer flex items-center justify-center gap-2">
                  <span>📞</span> Appeler l'agence
                </a>
              </div>

              <div class="p-3 bg-blue-50/70 rounded-xl text-center">
                <p class="text-[11px] text-blue-800 leading-tight">
                  🔒 SamaKeur garantit la mise en relation directe et sécurisée sans intermédiaire caché.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- Modal Signalement -->
    <div *ngIf="openReportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>⚠️</span> Signaler cette annonce
          </h3>
          <button (click)="openReportModal = false" class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
        </div>

        <p class="text-xs text-gray-500">
          Aidez-nous à préserver la sécurité de SamaKeur en signalant toute anomalie sur cette annonce.
        </p>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 uppercase">Motif du signalement</label>
          <select [(ngModel)]="reportReason" class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="SPAM">Annonce en double / SPAM</option>
            <option value="INAPPROPRIATE_CONTENT">Photos ou contenu inapproprié</option>
            <option value="MISLEADING_PRICE">Prix trompeur ou irréaliste</option>
            <option value="FAKE_LISTING">Arnaque / Annonce frauduleuse</option>
            <option value="OTHER">Autre problème</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1 uppercase">Détails complémentaires</label>
          <textarea [(ngModel)]="reportDetails" rows="3" placeholder="Précisez pourquoi cette annonce pose problème..."
                    class="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button (click)="openReportModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer">
            Annuler
          </button>
          <button (click)="sendReport()" [disabled]="submittingReport"
                  class="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition cursor-pointer disabled:opacity-50">
            {{ submittingReport ? 'Envoi...' : 'Envoyer le signalement' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Réservation de bien -->
    <div *ngIf="openReservationModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100 animate-fadeIn">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg">🏷️</span>
            <div>
              <h3 class="text-base font-black text-gray-900">Réserver ce logement</h3>
              <p class="text-xs text-gray-500">Bloquez ce bien avant qu'il ne soit pris</p>
            </div>
          </div>
          <button (click)="openReservationModal = false" class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
        </div>

        <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
          <strong>ℹ️ Information importante :</strong> Dès validation, cette annonce sera automatiquement <strong>retirée des annonces disponibles</strong> et vos coordonnées seront transmises à l'agence <strong>{{ getAgencyName() }}</strong> afin de vous contacter directement pour finaliser.
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">
              Nom complet <span class="text-red-500">*</span>
            </label>
            <input type="text" [(ngModel)]="clientFullName" placeholder="Ex: Mouhamed Fall"
                   class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">
              Numéro de téléphone <span class="text-red-500">*</span>
            </label>
            <input type="tel" [(ngModel)]="clientPhone" placeholder="Ex: +221 77 123 45 67"
                   class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">
              Message ou précisions (optionnel)
            </label>
            <textarea [(ngModel)]="reservationMessage" rows="2" placeholder="Ex: Je souhaite visiter ce bien rapidement..."
                      class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button (click)="openReservationModal = false" class="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer">
            Annuler
          </button>
          <button (click)="submitReservation()" [disabled]="submittingReservation || !clientFullName.trim() || !clientPhone.trim()"
                  class="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
            <span *ngIf="submittingReservation" class="inline-block animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
            <span>{{ submittingReservation ? 'Réservation...' : 'Confirmer la réservation' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Template Chargement -->
    <ng-template #loadingTemplate>
      <div class="min-h-[50vh] flex flex-col items-center justify-center text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-gray-700 text-base font-semibold">Chargement des détails de l'annonce...</p>
        <p class="text-xs text-gray-400 mt-1">Récupération des photos et coordonnées de l'agence</p>
      </div>
    </ng-template>

    <!-- Template Erreur -->
    <ng-template #errorTemplate>
      <div class="min-h-[50vh] flex flex-col items-center justify-center text-center py-20 px-4 space-y-4">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
          ⚠️
        </div>
        <h2 class="text-xl font-bold text-gray-900">Impossible d'afficher cette annonce</h2>
        <p class="text-gray-500 text-sm max-w-md">L'annonce demandée n'a pas pu être chargée ou le serveur est temporairement inaccessible.</p>
        <div class="flex items-center gap-3 pt-2">
          <button (click)="loadProperty()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer">
            🔄 Réessayer
          </button>
          <a routerLink="/properties" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition cursor-pointer">
            ← Retour aux annonces
          </a>
        </div>
      </div>
    </ng-template>
  `
})
export class PropertyDetailPageComponent implements OnInit {
  property?: Property;
  selectedImage: ImageType = null;
  loading = true;
  isFavorite = false;
  isLoggedIn = false;
  agencyPicFailed = false;

  agencyReviews: ReviewItem[] = [];
  newRating = 0;
  newComment = '';

  openReportModal = false;
  reportReason = 'FAKE_LISTING';
  reportDetails = '';
  submittingReport = false;

  openReservationModal = false;
  clientFullName = '';
  clientPhone = '';
  reservationMessage = '';
  submittingReservation = false;

  private readonly defaultFallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private authService: AuthService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  getDirectionsUrl(): string {
    if (!this.property) return '#';
    return getGoogleMapsDirectionsUrl(this.property.address, this.property.zone, this.property.city);
  }

  getSearchMapUrl(): string {
    if (!this.property) return '#';
    return getGoogleMapsSearchUrl(this.property.address, this.property.zone, this.property.city);
  }

  getSafeMapUrl(): SafeResourceUrl {
    if (!this.property) return '';
    const url = getGoogleMapsEmbedUrl(this.property.address, this.property.zone, this.property.city);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  copyAddress(): void {
    if (!this.property) return;
    const full = [this.property.address, this.property.zone, this.property.city, 'Sénégal'].filter(Boolean).join(', ');
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(full).then(() => {
        this.toastService.show('Adresse copiée dans le presse-papier !', 'success', 3000);
      }).catch(() => {
        this.toastService.show(full, 'info', 4000);
      });
    } else {
      this.toastService.show(full, 'info', 4000);
    }
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.currentUserValue;
    if (user) {
      if (user.fullName) {
        this.clientFullName = user.fullName;
      }
      if ((user as any).phone) {
        this.clientPhone = (user as any).phone;
      }
    }

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.fetchProperty(id);
      } else {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProperty(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (id) {
      this.fetchProperty(id);
    }
  }

  private fetchProperty(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.propertyService.getPropertyById(id).subscribe({
      next: (data: Property) => {
        this.property = data;
        if (data && data.images && data.images.length > 0) {
          this.selectedImage = data.images[0];
        }
        this.loading = false;
        this.cdr.detectChanges();
        this.checkFavoriteStatus(id);
        this.loadAgencyReviews();
      },
      error: (err) => {
        console.error('Erreur chargement annonce:', err);
        this.toastService.show("Impossible de charger les détails de l'annonce.", 'error');
        this.property = undefined;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private checkFavoriteStatus(propId: number): void {
    if (!this.isLoggedIn) {
      this.isFavorite = false;
      this.cdr.detectChanges();
      return;
    }
    this.propertyService.checkIsFavorite(propId).subscribe({
      next: (res) => {
        this.isFavorite = res.isFavorite;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isFavorite = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadAgencyReviews(): void {
    const agencyId = this.getAgencyId();
    if (agencyId) {
      this.propertyService.getAgencyReviews(agencyId).subscribe({
        next: (revs) => {
          this.agencyReviews = revs ? revs.slice(0, 3) : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.agencyReviews = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleFavorite(): void {
    if (!this.isLoggedIn) {
      this.toastService.show('Vous devez vous connecter à votre compte pour ajouter une annonce à vos favoris.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.property?.id) return;

    if (this.isFavorite) {
      this.propertyService.removeFavorite(this.property.id).subscribe({
        next: () => {
          this.isFavorite = false;
          this.toastService.show('Annonce retirée de vos favoris.', 'info');
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.show('Erreur lors du retrait du favori.', 'error');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.propertyService.addFavorite(this.property.id).subscribe({
        next: () => {
          this.isFavorite = true;
          this.toastService.show('Annonce ajoutée à vos favoris avec succès !', 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          this.toastService.show("Erreur lors de l'ajout aux favoris.", 'error');
          this.cdr.detectChanges();
        }
      });
    }
  }

  submitReview(): void {
    if (!this.isLoggedIn) {
      this.toastService.show('Veuillez vous connecter pour publier un avis.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const agencyId = this.getAgencyId();
    if (!agencyId) {
      this.toastService.show("Impossible d'identifier l'agence pour déposer un avis.", 'error');
      return;
    }
    if (!this.newRating || !this.newComment.trim()) {
      this.toastService.show('Veuillez attribuer une note (étoiles) et rédiger un commentaire.', 'warning');
      return;
    }

    this.propertyService.addReview(agencyId, this.newRating, this.newComment.trim()).subscribe({
      next: (rev) => {
        this.agencyReviews.unshift(rev);
        this.newRating = 0;
        this.newComment = '';
        this.toastService.show('Votre avis a été publié avec succès !', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || "Erreur lors de la publication de l'avis.";
        this.toastService.show(msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

  sendReport(): void {
    if (!this.isLoggedIn) {
      this.toastService.show('Connectez-vous pour signaler un contenu.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.property?.id) return;
    this.submittingReport = true;
    this.cdr.detectChanges();
    this.propertyService.reportProperty(this.property.id, this.reportReason, this.reportDetails).subscribe({
      next: () => {
        this.submittingReport = false;
        this.openReportModal = false;
        this.reportDetails = '';
        this.toastService.show('Votre signalement a été transmis à notre équipe de modération. Merci !', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submittingReport = false;
        const msg = err.error?.message || 'Erreur lors de la transmission du signalement.';
        this.toastService.show(msg, 'error');
        this.cdr.detectChanges();
      }
    });
  }

    getAgencyEmail(): string | null {
    return this.property?.agency?.email || null;
  }

  getAgencyAddress(): string | null {
    return this.property?.agency?.address || null;
  }

  getAgencyProfilePic(): string | null {
    return this.property?.agency?.profilePictureUrl || null;
  }

  isAgencyVerified(): boolean {
    return !!(this.property?.agency?.verified || this.property?.isVerifiedAgency);
  }

  onAgencyPicError(event: Event): void {
    this.agencyPicFailed = true;
    (event.target as HTMLImageElement).style.display = 'none';
  }

  getAgencyName(): string {
    return this.property?.agency?.companyName || this.property?.agency?.fullName || this.property?.agency?.name || this.property?.agencyName || 'Agence Partenaire';
  }

  getAgencyPhone(): string {
    return this.property?.agency?.phone || this.property?.agency?.telephone || this.property?.agencyPhone || '+221 77 000 00 00';
  }

  getAgencyId(): number | undefined {
    return this.property?.agency?.id || (this.property as any)?.agencyId;
  }

  getWhatsAppUrl(): string {
    const phone = this.getAgencyPhone();
    let clean = phone.replace(/[^0-9]/g, '');
    if (!clean.startsWith('221') && clean.length === 9) {
      clean = '221' + clean;
    }
    const msg = encodeURIComponent(`Bonjour ${this.getAgencyName()}, je vous contacte depuis la plateforme SamaKeur concernant votre annonce : "${this.property?.title}" (Prix : ${this.property?.price} FCFA). Ce bien est-il toujours disponible ?`);
    return `https://wa.me/${clean}?text=${msg}`;
  }

  getRawUrl(image: ImageType): string {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.imageUrl || image.url || '';
  }

  formatImageUrl(image: ImageType): string {
    const raw = this.getRawUrl(image);
    if (!raw) return this.defaultFallback;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) {
      return raw;
    }
    const cleanBase = API_CONFIG.baseUrl.replace(/\/api\/?$/, '');
    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    return `${cleanBase}${cleanPath}`;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultFallback;
  }

  isPropertyAvailable(): boolean {
    if (!this.property) return false;
    const status = (this.property.status || '').toString().toUpperCase();
    return !status || status === 'AVAILABLE' || status === 'DISPONIBLE';
  }

  openReserveModal(): void {
    const user = this.authService.currentUserValue;
    if (user && !this.clientFullName) {
      if (user.fullName) {
        this.clientFullName = user.fullName;
      }
      if ((user as any).phone && !this.clientPhone) {
        this.clientPhone = (user as any).phone;
      }
    }
    this.openReservationModal = true;
  }

  submitReservation(): void {
    if (!this.property?.id) return;
    if (!this.clientFullName.trim()) {
      this.toastService.show('Veuillez renseigner votre nom complet.', 'warning');
      return;
    }
    if (!this.clientPhone.trim()) {
      this.toastService.show('Veuillez renseigner votre numéro de téléphone.', 'warning');
      return;
    }

    this.submittingReservation = true;
    this.propertyService.reserveProperty(this.property.id, {
      clientFullName: this.clientFullName.trim(),
      clientPhone: this.clientPhone.trim(),
      message: this.reservationMessage.trim() || undefined
    }).subscribe({
      next: (updatedProp) => {
        this.submittingReservation = false;
        this.openReservationModal = false;
        if (this.property) {
          this.property.status = 'RESERVED' as any;
        }
        this.toastService.show(
          'Félicitations ! Votre réservation a été enregistrée avec succès. Ce bien a été retiré des annonces publiques et l\'agence a été notifiée de vos coordonnées.',
          'success',
          7000
        );
      },
      error: (err) => {
        this.submittingReservation = false;
        console.error('Erreur réservation:', err);
        const errMsg = err?.error?.message || err?.message || 'Erreur lors de la réservation du bien.';
        this.toastService.show(errMsg, 'error');
      }
    });
  }
}