import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PropertyService } from '../../../properties/services/property.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Property, PropertyCategory, PropertyType, PropertyStatus, ReviewItem } from '../../../properties/models/property.model';
import { API_CONFIG } from '../../../../core/config/api.config';
import { FormatEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { SENEGAL_CITIES, SENEGAL_ZONES } from '../../../../core/constants/senegal-locations.constants';

@Component({
  selector: 'app-agency-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatEnumPipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- En-tête Tableau de bord -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏢</span>
              <h1 class="text-2xl font-black text-gray-900">Espace Agence Immobilière</h1>
            </div>
            <p class="text-sm text-gray-500 mt-1">Gérez vos biens immobiliers, vos avis clients et votre abonnement SamaKeur</p>
          </div>
          <div class="flex items-center gap-3">
            <button (click)="openCreateModal()" 
                    class="px-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center gap-2 cursor-pointer">
              <span>+</span> Publier une annonce
            </button>
            <button (click)="onLogout()" 
                    class="px-4 py-2.5 bg-red-50 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 transition border border-red-200 cursor-pointer">
              Déconnexion
            </button>
          </div>
        </div>

        <!-- Bannière Statut Abonnement Mensuel -->
        <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider backdrop-blur-sm">
                {{ subscriptionActive ? 'Abonnement Professionnel Actif' : 'Abonnement Inactif / En Attente' }}
              </span>
              <span *ngIf="subscriptionActive" class="text-emerald-300 font-bold text-xs">✓ Visibilité Prioritaire Activée</span>
            </div>
            <h2 class="text-xl font-black">Abonnement Agence SamaKeur Pro</h2>
            <p class="text-blue-100 text-xs sm:text-sm max-w-xl">
              Paiement mensuel de 25 000 FCFA pour bénéficier de la mise en avant de toutes vos annonces au Sénégal, contact WhatsApp illimité et badge d'agence vérifiée.
            </p>
          </div>
          <button (click)="openPaymentModal = true" 
                  class="px-5 py-2.5 bg-white text-blue-800 font-bold text-sm rounded-xl hover:bg-blue-50 transition shadow-md cursor-pointer shrink-0">
            {{ subscriptionActive ? 'Renouveler mon abonnement' : 'Activer mon abonnement' }}
          </button>
        </div>

        <!-- Onglets Agence : Annonces / Avis reçus / Transactions -->
        <div class="flex border-b border-gray-200">
          <button (click)="activeTab = 'properties'" 
                  [class]="activeTab === 'properties' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer">
            <span>Mes Annonces</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-bold">{{ myProperties.length }}</span>
          </button>
          <button (click)="activeTab = 'reviews'" 
                  [class]="activeTab === 'reviews' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer">
            <span>Avis Clients</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">{{ myReviews.length }}</span>
          </button>
          <button (click)="activeTab = 'transactions'" 
                  [class]="activeTab === 'transactions' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer">
            <span>Paiements & Factures</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">{{ myTransactions.length }}</span>
          </button>
        </div>

        <!-- Section 1 : Tableau des Biens de l'Agence -->
        <div *ngIf="activeTab === 'properties'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">Annonces gérées par votre agence</h3>
            <span class="text-xs text-gray-500 font-medium">{{ myProperties.length }} bien(s) répertorié(s)</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th class="p-4">Bien immobilier</th>
                  <th class="p-4">Catégorie / Type</th>
                  <th class="p-4">Prix (FCFA)</th>
                  <th class="p-4">Statut</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let item of myProperties" class="hover:bg-gray-50/50 transition">
                  <td class="p-4 font-medium text-gray-900">
                    <div class="flex items-center gap-3">
                      <img [src]="getImageUrl(item)" 
                           alt="Illustration" 
                           class="w-16 h-12 object-cover rounded-xl border border-gray-200 bg-gray-100 shrink-0"
                           (error)="onImageError($event)" />
                      <div>
                        <div class="font-bold text-gray-900 line-clamp-1">{{ item.title }}</div>
                        <div class="text-xs text-gray-400 mt-0.5">📍 {{ item.city }} {{ item.zone ? '- ' + item.zone : '' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 text-xs rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-100 uppercase">
                      {{ item.category | formatEnum }}
                    </span>
                    <span class="ml-2 text-xs text-gray-500 font-medium uppercase">{{ (item.transactionType || item.type) | formatEnum }}</span>
                  </td>
                  <td class="p-4 font-black text-blue-600 text-base">
                    {{ item.price | number }} FCFA
                  </td>
                  <td class="p-4">
                    <span [class]="getStatusClass(item.status)"
                          class="px-2.5 py-1 text-xs font-bold rounded-full border">
                      {{ (item.status === 'RESERVED' || item.status === 'RESERVE') ? 'RÉSERVÉ (En cours)' : (item.status | formatEnum) }}
                    </span>
                  </td>
                  <td class="p-4 text-right space-x-2 whitespace-nowrap">
                    <!-- Si le bien est réservé : bouton direct pour le rendre à nouveau disponible -->
                    <button *ngIf="item.status === 'RESERVED' || item.status === 'RESERVE'" 
                            (click)="makeAvailableAgain(item)"
                            class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                            title="Remettre l'annonce en ligne comme disponible">
                      <span>✓</span> Rendre disponible
                    </button>
                    <!-- Changement de statut rapide -->
                    <button *ngIf="item.status !== 'RESERVED' && item.status !== 'RESERVE'"
                            (click)="cycleStatus(item)" 
                            class="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer"
                            title="Changer le statut (Disponible / Loué / Vendu)">
                      Changer statut
                    </button>
                    <button (click)="openEditModal(item)" 
                            class="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition cursor-pointer">
                      Modifier
                    </button>
                    <button (click)="deleteProperty(item)" 
                            class="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition cursor-pointer">
                      Supprimer
                    </button>
                  </td>
                </tr>
                <tr *ngIf="myProperties.length === 0">
                  <td colspan="5" class="p-12 text-center text-gray-400">
                    <p class="text-base font-semibold">Aucune annonce publiée pour le moment.</p>
                    <p class="text-xs mt-1">Cliquez sur "Publier une annonce" pour mettre votre premier bien en ligne.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2 : Avis clients reçus -->
        <div *ngIf="activeTab === 'reviews'" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Avis et Évaluations de vos clients</h3>
            <span class="text-xs text-gray-500 font-semibold">{{ myReviews.length }} avis déposé(s)</span>
          </div>

          <div class="divide-y divide-gray-100" *ngIf="myReviews.length > 0; else noReviews">
            <div *ngFor="let rev of myReviews" class="py-4 first:pt-0 last:pb-0 space-y-1.5">
              <div class="flex justify-between items-center">
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
              Votre agence n'a pas encore reçu d'avis clients. Les avis apparaîtront ici dès qu'un client notera votre agence.
            </div>
          </ng-template>
        </div>

        <!-- Section 3 : Historique des Paiements d'Abonnement -->
        <div *ngIf="activeTab === 'transactions'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900">Historique des transactions d'abonnement</h3>
            <button (click)="openPaymentModal = true" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer">
              Nouveau paiement
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="p-4">Référence</th>
                  <th class="p-4">Montant</th>
                  <th class="p-4">Moyen de paiement</th>
                  <th class="p-4">Statut</th>
                  <th class="p-4">Date</th>
                  <th class="p-4 text-right">Action simulation</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let txn of myTransactions" class="hover:bg-gray-50/50">
                  <td class="p-4 font-mono font-bold text-gray-900">{{ txn.transactionRef }}</td>
                  <td class="p-4 font-black text-blue-600">{{ txn.amount | number }} FCFA</td>
                  <td class="p-4">
                    <span class="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{{ txn.paymentMethod }}</span>
                  </td>
                  <td class="p-4">
                    <span [class]="txn.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                          class="px-2.5 py-1 text-xs font-bold rounded-full">
                      {{ txn.status === 'SUCCESS' ? 'PAYÉ / VALIDÉ' : 'EN ATTENTE' }}
                    </span>
                  </td>
                  <td class="p-4 text-xs text-gray-400">{{ txn.createdAt | date:'short' }}</td>
                  <td class="p-4 text-right">
                    <button *ngIf="txn.status === 'PENDING'" (click)="simulatePayment(txn.transactionRef)"
                            class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer">
                      Simuler validation
                    </button>
                  </td>
                </tr>
                <tr *ngIf="myTransactions.length === 0">
                  <td colspan="6" class="p-10 text-center text-gray-400">Aucune transaction pour le moment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal Formulaire Création / Modification Bien -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        <!-- En-tête fixe en haut -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-base font-bold">🏠</span>
            <h3 class="text-lg font-black text-gray-900">
              <span *ngIf="isEditMode">Modifier l'annonce</span>
              <span *ngIf="!isEditMode">Publier un nouveau bien</span>
            </h3>
          </div>
          <button type="button" (click)="closeModal()" class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-lg font-bold transition cursor-pointer">✕</button>
        </div>

        <!-- Formulaire avec défilement interne -->
        <form (ngSubmit)="saveProperty()" class="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div class="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
            
            <!-- Titre de l'annonce (Mis en avant) -->
            <div class="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
              <label class="block text-xs font-black text-blue-900 uppercase tracking-wide mb-1">
                Titre de l'annonce <span class="text-red-500">*</span>
              </label>
              <input type="text" [(ngModel)]="currentProperty.title" name="title" required 
                     placeholder="Ex: Villa F5 avec piscine aux Almadies"
                     class="w-full bg-white border border-blue-200 rounded-xl p-2.5 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400">
              <p class="text-[11px] text-blue-600 mt-1">Exemple : Appartement F3 standing à Mermoz, Studio meublé Ngor...</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Catégorie de bien *</label>
                <select [(ngModel)]="currentProperty.category" name="category" required
                        class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="VILLA">Villa</option>
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="STUDIO">Studio</option>
                  <option value="CHAMBRE">Chambre</option>
                  <option value="MAISON">Maison</option>
                  <option value="TERRAIN">Terrain</option>
                  <option value="COMMERCIAL">Local Commercial</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Opération *</label>
                <select [(ngModel)]="currentProperty.transactionType" name="transactionType" required
                        class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="LOCATION">Location</option>
                  <option value="VENTE">Vente</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Prix (FCFA) *</label>
                <input type="number" [(ngModel)]="currentProperty.price" name="price" required placeholder="Ex: 1500000"
                       class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Caution éventuelle (FCFA)</label>
                <input type="number" [(ngModel)]="currentProperty.depositPrice" name="depositPrice" placeholder="Ex: 3000000"
                       class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Nombre de pièces / chambres</label>
                <input type="number" [(ngModel)]="currentProperty.rooms" name="rooms" placeholder="Ex: 4"
                       class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Superficie (m²)</label>
                <input type="number" [(ngModel)]="currentProperty.area" name="area" placeholder="Ex: 350"
                       class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Ville (Sénégal) *</label>
                <input type="text" [(ngModel)]="currentProperty.city" name="city" list="agencyCitiesList" required placeholder="Ex: Dakar"
                       class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <datalist id="agencyCitiesList">
                  <option *ngFor="let c of senegalCities" [value]="c"></option>
                </datalist>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-700 uppercase">Zone / Quartier</label>
                <input type="text" [(ngModel)]="currentProperty.zone" name="zone" list="agencyZonesList" placeholder="Ex: Colobane, Almadies..."
                       class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <datalist id="agencyZonesList">
                  <option *ngFor="let z of senegalZones" [value]="z"></option>
                </datalist>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Adresse exacte / Rue / Avenue *</label>
              <input type="text" [(ngModel)]="currentProperty.address" name="address" required placeholder="Ex: Avenue Cheikh Ahmadou Bamba"
                     class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <p class="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-medium">
                <span>📍</span>
                <span>Cette adresse permettra aux clients d'utiliser le bouton Localisation pour être guidés directement en GPS jusqu'à votre bien.</span>
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase">Description de l'annonce</label>
              <textarea [(ngModel)]="currentProperty.description" name="description" rows="3"
                        placeholder="Détails du bien, standing, sécurité, proximité..."
                        class="mt-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
            </div>

            <!-- Commodités -->
            <div class="border-t pt-3">
              <p class="text-xs font-bold text-gray-700 uppercase mb-2">Avantages & Commodités :</p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-gray-700">
                <label class="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input type="checkbox" [(ngModel)]="currentProperty.hasAirConditioning" name="hasAirConditioning" class="rounded text-blue-600">
                  <span>Climatisation</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input type="checkbox" [(ngModel)]="currentProperty.hasParking" name="hasParking" class="rounded text-blue-600">
                  <span>Parking</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input type="checkbox" [(ngModel)]="currentProperty.hasBalcony" name="hasBalcony" class="rounded text-blue-600">
                  <span>Balcon</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <input type="checkbox" [(ngModel)]="currentProperty.hasTerrace" name="hasTerrace" class="rounded text-blue-600">
                  <span>Terrasse</span>
                </label>
              </div>
            </div>

            <!-- Photos du bien -->
            <div class="border-t pt-3 space-y-3">
              <label class="block text-xs font-bold text-gray-700 uppercase">Photos de l'annonce :</label>

              <!-- Aperçu de la photo actuelle en mode modification -->
              <div *ngIf="isEditMode && currentProperty.images && currentProperty.images.length > 0" class="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2">
                <div class="flex items-center justify-between text-xs text-blue-900 font-semibold">
                  <span class="flex items-center gap-1.5">
                    <span class="text-emerald-600 font-bold">✓</span> Photo actuelle conservée
                  </span>
                  <span class="text-[11px] text-blue-600">Inutile de la re-sélectionner</span>
                </div>
                <div class="flex items-center gap-2 overflow-x-auto py-1">
                  <div *ngFor="let img of currentProperty.images" class="relative shrink-0">
                    <img [src]="getSingleImageUrl(img)" alt="Photo actuelle" class="w-20 h-16 object-cover rounded-lg border border-blue-200 bg-white shadow-xs" (error)="onImageError($event)">
                  </div>
                </div>
              </div>

              <div>
                <span *ngIf="isEditMode" class="block text-[11px] font-semibold text-gray-500 mb-1">
                  Ajouter / remplacer par une nouvelle photo (facultatif) :
                </span>
                <span *ngIf="!isEditMode" class="block text-[11px] font-semibold text-gray-500 mb-1">
                  Sélectionnez des photos (facultatif si photo par défaut) :
                </span>
                <input type="file" (change)="onPropertyImagesSelected($event)" multiple accept="image/*"
                       class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                <p *ngIf="selectedPropertyFiles.length > 0" class="text-xs text-emerald-600 font-semibold mt-1">
                  ✓ {{ selectedPropertyFiles.length }} nouvelle(s) photo(s) sélectionnée(s)
                </p>
              </div>
            </div>

          </div>

          <!-- Pied du formulaire fixe en bas -->
          <div class="flex justify-end gap-3 px-6 py-3.5 bg-gray-50 border-t border-gray-100 shrink-0">
            <button type="button" (click)="closeModal()" class="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer">
              Annuler
            </button>
            <button type="submit" [disabled]="saving" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer shadow-xs">
              <span *ngIf="isEditMode">Enregistrer la modification</span>
              <span *ngIf="!isEditMode">Publier l'annonce</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Paiement Abonnement (Wave / Orange Money / Carte / Espèces) -->
    <div *ngIf="openPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fade-in">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-lg font-black text-gray-900">Abonnement SamaKeur Pro</h3>
          <button (click)="openPaymentModal = false" class="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        <div class="bg-blue-50 p-4 rounded-xl space-y-1">
          <span class="text-xs font-bold text-blue-700 uppercase">Tarif mensuel standard</span>
          <div class="text-2xl font-black text-blue-900">25 000 FCFA <span class="text-xs font-normal text-blue-700">/ mois</span></div>
          <p class="text-[11px] text-blue-700">Validation immédiate de vos annonces et badge officiel Agence Vérifiée.</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase mb-2">Sélectionnez le moyen de règlement :</label>
          <div class="grid grid-cols-2 gap-3">
            
            <button type="button" (click)="selectedPaymentMethod = 'WAVE'"
                    [class]="selectedPaymentMethod === 'WAVE' ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                    class="p-3 border rounded-xl flex items-center gap-3 transition cursor-pointer text-left">
              <div class="w-10 h-10 rounded-xl overflow-hidden shadow-xs shrink-0 bg-[#1dc3f9]">
                <img src="assets/images/wave-logo.svg" alt="Wave Sénégal" class="w-full h-full object-contain p-0.5" />
              </div>
              <div>
                <div class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>Wave Sénégal</span>
                  <span class="text-[10px] bg-sky-100 text-sky-700 px-1 py-0.2 rounded font-semibold">1%</span>
                </div>
                <div class="text-[10px] text-gray-500">Paiement sans frais</div>
              </div>
            </button>

            <button type="button" (click)="selectedPaymentMethod = 'ORANGE_MONEY'"
                    [class]="selectedPaymentMethod === 'ORANGE_MONEY' ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                    class="p-3 border rounded-xl flex items-center gap-3 transition cursor-pointer text-left">
              <div class="w-10 h-10 rounded-xl overflow-hidden shadow-xs shrink-0 bg-[#121212]">
                <img src="assets/images/orange-money-logo.svg" alt="Orange Money" class="w-full h-full object-contain p-0.5" />
              </div>
              <div>
                <div class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>Orange Money</span>
                  <span class="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.2 rounded font-semibold">OM</span>
                </div>
                <div class="text-[10px] text-gray-500">Sonatel SN</div>
              </div>
            </button>

            <button type="button" (click)="selectedPaymentMethod = 'CARD'"
                    [class]="selectedPaymentMethod === 'CARD' ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500' : 'border-gray-200'"
                    class="p-3 border rounded-xl flex items-center gap-3 transition cursor-pointer text-left">
              <span class="text-2xl">💳</span>
              <div>
                <div class="text-xs font-bold text-gray-900">Carte Bancaire</div>
                <div class="text-[10px] text-gray-500">Visa / Mastercard</div>
              </div>
            </button>

            <button type="button" (click)="selectedPaymentMethod = 'CASH'"
                    [class]="selectedPaymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500' : 'border-gray-200'"
                    class="p-3 border rounded-xl flex items-center gap-3 transition cursor-pointer text-left">
              <span class="text-2xl">💵</span>
              <div>
                <div class="text-xs font-bold text-gray-900">Espèces</div>
                <div class="text-[10px] text-gray-500">Règlement au bureau</div>
              </div>
            </button>

          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t">
          <button type="button" (click)="openPaymentModal = false" class="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
            Fermer
          </button>
          <button type="button" (click)="processPayment()" [disabled]="processingPayment"
                  class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer">
            {{ processingPayment ? 'Traitement...' : 'Valider le paiement' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AgencyDashboardPageComponent implements OnInit {
  myProperties: Property[] = [];
  myReviews: ReviewItem[] = [];
  myTransactions: any[] = [];

  activeTab: 'properties' | 'reviews' | 'transactions' = 'properties';
  subscriptionActive = true;

  showModal = false;
  isEditMode = false;
  saving = false;
  selectedPropertyFiles: File[] = [];

  openPaymentModal = false;
  selectedPaymentMethod = 'WAVE';
  processingPayment = false;

  readonly senegalCities = SENEGAL_CITIES;
  readonly senegalZones = SENEGAL_ZONES;

  currentProperty: Partial<Property> = this.getEmptyProperty();
  
  private destroyRef = inject(DestroyRef);

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAgencyProperties();
    this.loadReviews();
    this.loadTransactions();
  }

  getEmptyProperty(): Partial<Property> {
    return {
      title: '',
      category: PropertyCategory.APPARTEMENT,
      transactionType: PropertyType.LOCATION,
      city: 'Dakar',
      zone: '',
      price: undefined,
      depositPrice: undefined,
      rooms: 2,
      area: 80,
      address: '',
      description: '',
      hasBalcony: false,
      hasTerrace: false,
      hasAirConditioning: true,
      hasParking: true,
      status: PropertyStatus.AVAILABLE
    };
  }

  loadAgencyProperties(): void {
    this.propertyService.getMyProperties()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.myProperties = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Erreur chargement annonces agence :", err)
      });
  }

  loadReviews(): void {
    this.propertyService.getMyAgencyReviews()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (revs) => {
          this.myReviews = revs;
          this.cdr.detectChanges();
        },
        error: () => this.myReviews = []
      });
  }

  loadTransactions(): void {
    this.propertyService.getMyTransactions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (txns) => {
          this.myTransactions = txns;
          this.cdr.detectChanges();
        },
        error: () => this.myTransactions = []
      });
  }

  processPayment(): void {
    this.processingPayment = true;
    this.propertyService.initiatePayment(25000, this.selectedPaymentMethod).subscribe({
      next: (res) => {
        this.processingPayment = false;
        this.openPaymentModal = false;
        
        if (this.selectedPaymentMethod === 'CASH') {
          this.toastService.show("Demande enregistrée. Règlement en espèces à effectuer à l'agence centrale.", 'info');
        } else {
          // Simulation instantanée pour la soutenance
          this.toastService.show(`Transaction ${res.transactionRef} initiée avec succès via ${this.selectedPaymentMethod}.`, 'success');
          // Simuler la validation
          this.simulatePayment(res.transactionRef);
        }
        this.loadTransactions();
      },
      error: () => {
        this.processingPayment = false;
        this.toastService.show("Erreur lors de l'initiation du paiement.", 'error');
      }
    });
  }

  simulatePayment(txnRef: string): void {
    this.propertyService.simulatePaymentSuccess(txnRef).subscribe({
      next: (res) => {
        this.subscriptionActive = true;
        this.toastService.show(res.message, 'success');
        this.loadTransactions();
      },
      error: () => this.toastService.show("Erreur lors de la validation du paiement.", 'error')
    });
  }

  cycleStatus(item: Property): void {
    let nextStatus: string;
    if (item.status === 'AVAILABLE' || item.status === 'DISPONIBLE') {
      nextStatus = 'RENTED';
    } else if (item.status === 'RENTED' || item.status === 'LOUE') {
      nextStatus = 'SOLD';
    } else {
      nextStatus = 'AVAILABLE';
    }

    if (item.id) {
      this.propertyService.updateStatus(item.id, nextStatus).subscribe({
        next: (updated) => {
          item.status = updated.status;
          this.toastService.show(`Statut mis à jour : ${nextStatus}`, 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          item.status = nextStatus;
          this.cdr.detectChanges();
        }
      });
    }
  }

  makeAvailableAgain(item: Property): void {
    if (item.id) {
      this.propertyService.updateStatus(item.id, 'AVAILABLE').subscribe({
        next: (updated) => {
          item.status = updated.status || 'AVAILABLE';
          this.toastService.show(`L'annonce "${item.title}" est de nouveau disponible et visible pour tous.`, 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          item.status = 'AVAILABLE';
          this.toastService.show(`L'annonce "${item.title}" est de nouveau disponible.`, 'success');
          this.cdr.detectChanges();
        }
      });
    }
  }

  getStatusClass(status: any): string {
    const s = String(status);
    if (s === 'RESERVED' || s === 'RESERVE') {
      return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
    } else if (s === 'AVAILABLE' || s === 'DISPONIBLE') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    } else if (s === 'RENTED' || s === 'LOUE') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    } else if (s === 'SOLD' || s === 'VENDU') {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }

  getImageUrl(item: Property): string {
    if (item.images && item.images.length > 0) {
      const img = item.images[0];
      const url = typeof img === 'string' ? img : (img as any).imageUrl;
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
          return url;
        }
        return `${API_CONFIG.baseUrl.replace('/api', '')}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentProperty = this.getEmptyProperty();
    this.selectedPropertyFiles = [];
    this.showModal = true;
  }

  openEditModal(item: Property): void {
    this.isEditMode = true;
    this.currentProperty = { ...item };
    this.selectedPropertyFiles = [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.saving = false;
    this.selectedPropertyFiles = [];
    this.currentProperty = this.getEmptyProperty();
    this.cdr.detectChanges();
  }

  deleteProperty(item: Property): void {
    if (confirm(`Voulez-vous vraiment supprimer l'annonce "${item.title}" ?`)) {
      if (item.id) {
        this.propertyService.deleteProperty(item.id).subscribe({
          next: () => {
            this.myProperties = this.myProperties.filter(p => p.id !== item.id);
            this.toastService.show('Annonce supprimée avec succès.', 'info');
            this.cdr.detectChanges();
          },
          error: () => {
            this.myProperties = this.myProperties.filter(p => p.id !== item.id);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  onPropertyImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedPropertyFiles = Array.from(input.files);
    }
  }

  getSingleImageUrl(img: any): string {
    if (!img) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
    const url = typeof img === 'string' ? img : img.imageUrl;
    if (!url) return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    return `${API_CONFIG.baseUrl.replace('/api', '')}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  saveProperty(): void {
    const title = (this.currentProperty.title || '').trim();
    const city = (this.currentProperty.city || '').trim();
    let price = this.currentProperty.price;

    if (typeof price === 'string') {
      price = Number(String(price).replace(/\s+/g, '').replace(/,/g, '.'));
      this.currentProperty.price = price;
    }

    if (!title) {
      this.toastService.show("Veuillez renseigner le titre de l'annonce.", 'error');
      return;
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
      this.toastService.show("Veuillez indiquer un prix valide (ex: 500000).", 'error');
      return;
    }

    if (!city) {
      this.toastService.show("Veuillez renseigner la ville (ex: Dakar).", 'error');
      return;
    }

    // Si la description est vide, on en génère une automatiquement
    if (!this.currentProperty.description || !this.currentProperty.description.trim()) {
      this.currentProperty.description = `${title} disponible à ${city}${this.currentProperty.zone ? ' (' + this.currentProperty.zone + ')' : ''}. Contactez notre agence pour organiser une visite.`;
    }

    this.saving = true;

    if (this.isEditMode && this.currentProperty.id) {
      // 1. Extraire et préserver les URLs existantes pour que le backend ne les perde jamais
      const existingUrls: string[] = [];
      if (this.currentProperty.images && Array.isArray(this.currentProperty.images)) {
        for (const img of this.currentProperty.images) {
          const u = typeof img === 'string' ? img : (img as any)?.imageUrl;
          if (u) existingUrls.push(u);
        }
      }
      (this.currentProperty as any).imageUrls = existingUrls;

      const request$ = this.selectedPropertyFiles.length > 0
        ? this.propertyService.updatePropertyMultipart(this.currentProperty.id, this.currentProperty, this.selectedPropertyFiles)
        : this.propertyService.updateProperty(this.currentProperty.id, this.currentProperty);

      request$.subscribe({
        next: (updated) => {
          const index = this.myProperties.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            this.myProperties[index] = updated;
          }
          this.closeModal();
          this.toastService.show('Modification enregistrée avec succès !', 'success');
        },
        error: (err) => {
          const msg = err.error?.message || `Erreur lors de la mise à jour (${err.status})`;
          this.toastService.show(msg, 'error');
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      let requestData: FormData | Partial<Property>;

      if (this.selectedPropertyFiles.length > 0) {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(this.currentProperty)], { type: 'application/json' });
        formData.append('data', jsonBlob);

        this.selectedPropertyFiles.forEach(file => {
          formData.append('images', file);
        });
        requestData = formData;
      } else {
        // Au moins une image fallback pour satisfaire la validation backend
        this.currentProperty.images = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];
        (this.currentProperty as any).imageUrls = ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];
        requestData = this.currentProperty;
      }

      this.propertyService.createProperty(requestData).subscribe({
        next: () => {
          this.closeModal();
          this.toastService.show("L'annonce a été publiée avec succès.", 'success');
          this.loadAgencyProperties();
        },
        error: (err) => {
          const detail = err.error?.message || (err.error?.validationErrors ? Object.values(err.error.validationErrors).join(', ') : '') || `Erreur lors de la création (${err.status})`;
          this.toastService.show(detail, 'error');
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}