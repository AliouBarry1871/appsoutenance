import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../../properties/services/property.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Property, ReviewItem } from '../../../properties/models/property.model';
import { FormatEnumPipe } from '../../../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FormatEnumPipe],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- En-tête Administration -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🛡️</span>
              <h1 class="text-2xl font-black text-gray-900">Espace Administration & Modération</h1>
            </div>
            <p class="text-xs sm:text-sm text-gray-500 mt-1">Supervision globale de SamaKeur : conformité légale, KYC, sécurité et abonnements</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Plateforme active • Sénégal
            </span>
          </div>
        </div>

        <!-- Onglets Navigation Admin -->
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button (click)="activeTab = 'agencies'" 
                  [class]="activeTab === 'agencies' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>Agences & KYC</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-bold">{{ agencies.length }}</span>
          </button>
          <button (click)="activeTab = 'properties'" 
                  [class]="activeTab === 'properties' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>Toutes les Annonces</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">{{ properties.length }}</span>
          </button>
          <button (click)="activeTab = 'reports'" 
                  [class]="activeTab === 'reports' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>Signalements</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-red-50 text-red-700 font-bold">{{ reports.length }}</span>
          </button>
          <button (click)="activeTab = 'reviews'" 
                  [class]="activeTab === 'reviews' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>Modération Avis</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 font-bold">{{ reviews.length }}</span>
          </button>
          <button (click)="activeTab = 'payments'" 
                  [class]="activeTab === 'payments' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="py-3 px-5 border-b-2 text-sm transition flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>Abonnements & Finances</span>
            <span class="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-bold">{{ transactions.length }}</span>
          </button>
        </div>

        <!-- Onglet 1 : Agences & Vérification KYC (Pièces d'identité) -->
        <div *ngIf="activeTab === 'agencies'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden space-y-4">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Contrôle des Agences Immobilières</h3>
              <p class="text-xs text-gray-500">Examinez les pièces justificatives (CNI / Passeport) et gérez les autorisations de publication.</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="p-4">Agence</th>
                  <th class="p-4">Identifiants Légaux</th>
                  <th class="p-4">Contact</th>
                  <th class="p-4">Pièce d'Identité</th>
                  <th class="p-4">Statut Compte</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let agency of agencies" class="hover:bg-gray-50/50">
                  <td class="p-4 font-medium text-gray-900">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center overflow-hidden shrink-0">
                        <img *ngIf="agency.profilePictureUrl" [src]="agency.profilePictureUrl" [alt]="agency.companyName" class="w-full h-full object-cover">
                        <span *ngIf="!agency.profilePictureUrl">{{ agency.companyName?.charAt(0) || 'A' }}</span>
                      </div>
                      <div>
                        <div class="font-bold flex items-center gap-1.5">
                          <span>{{ agency.companyName }}</span>
                          <span *ngIf="agency.verified" class="text-blue-600 font-bold" title="Vérifiée">✓</span>
                        </div>
                        <div class="text-xs text-gray-400">Resp: {{ agency.fullName }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="p-4 text-xs font-mono">
                    <div>NINEA: {{ agency.ninea || 'N/A' }}</div>
                    <div>RCCM: {{ agency.rccm || 'N/A' }}</div>
                  </td>
                  <td class="p-4 text-xs">
                    <div>📞 {{ agency.phone }}</div>
                    <div class="text-gray-400">{{ agency.email }}</div>
                  </td>
                  <td class="p-4">
                    <button (click)="openKycModal(agency)" 
                            class="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                      <span>🔍</span> Inspecter pièce
                    </button>
                  </td>
                  <td class="p-4">
                    <div class="space-y-1">
                      <span [class]="agency.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                            class="px-2.5 py-0.5 text-xs font-bold rounded-full block text-center">
                        {{ agency.verified ? '✓ Vérifiée' : 'En Attente KYC' }}
                      </span>
                      <span [class]="agency.enabled ? 'text-emerald-600' : 'text-red-600'" class="text-[11px] font-semibold block text-center">
                        {{ agency.enabled ? 'Actif' : 'Suspendu' }}
                      </span>
                    </div>
                  </td>
                  <td class="p-4 text-right space-y-1 whitespace-nowrap">
                    <button (click)="toggleVerify(agency)" 
                            [class]="agency.verified ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'"
                            class="px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer">
                      {{ agency.verified ? 'Retirer statut' : 'Attribuer Vérifié' }}
                    </button>
                    <button (click)="toggleStatus(agency)" 
                            [class]="agency.enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'"
                            class="px-3 py-1 text-xs font-bold rounded-lg transition ml-2 cursor-pointer">
                      {{ agency.enabled ? 'Suspendre' : 'Réactiver' }}
                    </button>
                  </td>
                </tr>
                <tr *ngIf="agencies.length === 0">
                  <td colspan="6" class="p-8 text-center text-gray-400">Aucune agence répertoriée.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet 2 : Modération des Annonces de la plateforme -->
        <div *ngIf="activeTab === 'properties'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Contrôle des Annonces Immobilières</h3>
              <p class="text-xs text-gray-500">Supprimez directement toute annonce frauduleuse ou non conforme au marché.</p>
            </div>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">{{ properties.length }} annonces</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="p-4">Bien</th>
                  <th class="p-4">Agence émettrice</th>
                  <th class="p-4">Prix & Catégorie</th>
                  <th class="p-4">Localisation</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let prop of properties" class="hover:bg-gray-50/50">
                  <td class="p-4 font-bold text-gray-900">
                    <a [routerLink]="['/properties', prop.id]" class="hover:text-blue-600 flex items-center gap-2">
                      <span>{{ prop.title }}</span>
                      <span class="text-xs text-blue-600">↗</span>
                    </a>
                  </td>
                  <td class="p-4 text-xs font-medium">
                    🏢 {{ prop.agency?.companyName || prop.agencyName || 'Agence' }}
                  </td>
                  <td class="p-4 text-xs">
                    <span class="font-bold text-blue-600">{{ prop.price | number }} FCFA</span>
                    <div class="text-gray-400 uppercase">{{ prop.category | formatEnum }} • {{ (prop.transactionType || prop.type) | formatEnum }}</div>
                  </td>
                  <td class="p-4 text-xs">📍 {{ prop.city }} ({{ prop.zone }})</td>
                  <td class="p-4 text-right">
                    <button (click)="deleteFraudulentProperty(prop)" 
                            class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer">
                      Supprimer annonce frauduleuse
                    </button>
                  </td>
                </tr>
                <tr *ngIf="properties.length === 0">
                  <td colspan="5" class="p-8 text-center text-gray-400">Aucune annonce sur la plateforme.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet 3 : Modération des Signalements -->
        <div *ngIf="activeTab === 'reports'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Signalements d'Annonces Frauduleuses</h3>
            <p class="text-xs text-gray-500">Traitez les signalements effectués par les chercheurs de logement.</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="p-4">Annonce concernée</th>
                  <th class="p-4">Motif</th>
                  <th class="p-4">Détails</th>
                  <th class="p-4">Signaleur</th>
                  <th class="p-4">Statut</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let item of reports" class="hover:bg-gray-50/50">
                  <td class="p-4 font-bold text-gray-900">
                    <span *ngIf="item.property">{{ item.property.title }}</span>
                    <span *ngIf="!item.property">Annonce #{{ item.propertyId }}</span>
                  </td>
                  <td class="p-4">
                    <span class="px-2 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-md">
                      {{ item.reason }}
                    </span>
                  </td>
                  <td class="p-4 text-xs text-gray-500 max-w-xs">{{ item.description }}</td>
                  <td class="p-4 text-xs text-gray-400">{{ item.reporter?.email || 'Client' }}</td>
                  <td class="p-4">
                    <span [class]="item.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                          class="px-2.5 py-0.5 text-xs font-bold rounded-full">
                      {{ item.status || 'PENDING' }}
                    </span>
                  </td>
                  <td class="p-4 text-right space-x-2 whitespace-nowrap">
                    <button *ngIf="item.status !== 'RESOLVED'" (click)="resolveReport(item)"
                            class="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition cursor-pointer">
                      Clôturer
                    </button>
                    <button *ngIf="item.property" (click)="deleteFraudulentProperty(item.property)"
                            class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition cursor-pointer">
                      Supprimer le bien
                    </button>
                  </td>
                </tr>
                <tr *ngIf="reports.length === 0">
                  <td colspan="6" class="p-8 text-center text-gray-400">Aucun signalement en attente.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet 4 : Modération des Avis & Évaluations -->
        <div *ngIf="activeTab === 'reviews'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Surveillance des Évaluations et Avis</h3>
            <p class="text-xs text-gray-500">Supprimez les avis diffamatoires ou non conformes.</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="p-4">Client</th>
                  <th class="p-4">Agence visée</th>
                  <th class="p-4">Note</th>
                  <th class="p-4">Commentaire</th>
                  <th class="p-4">Date</th>
                  <th class="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let rev of reviews" class="hover:bg-gray-50/50">
                  <td class="p-4 font-bold text-gray-900 text-xs">{{ rev.client?.fullName || 'Client' }}</td>
                  <td class="p-4 text-xs font-semibold text-blue-600">{{ rev.agency?.companyName || 'Agence' }}</td>
                  <td class="p-4 text-amber-500 font-bold text-sm">{{ rev.rating }} ★</td>
                  <td class="p-4 text-xs text-gray-600 max-w-sm">{{ rev.comment }}</td>
                  <td class="p-4 text-xs text-gray-400">{{ rev.createdAt | date:'shortDate' }}</td>
                  <td class="p-4 text-right">
                    <button (click)="deleteReview(rev)" 
                            class="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg transition cursor-pointer">
                      Supprimer
                    </button>
                  </td>
                </tr>
                <tr *ngIf="reviews.length === 0">
                  <td colspan="6" class="p-8 text-center text-gray-400">Aucun avis répertorié.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Onglet 5 : Abonnements & Finances -->
        <div *ngIf="activeTab === 'payments'" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Suivi des Abonnements & Transactions</h3>
            <p class="text-xs text-gray-500">Validez les paiements en espèces effectués au bureau et visualisez les flux Wave et Orange Money.</p>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
              <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th class="p-4">Référence</th>
                  <th class="p-4">Agence</th>
                  <th class="p-4">Montant</th>
                  <th class="p-4">Moyen de paiement</th>
                  <th class="p-4">Statut</th>
                  <th class="p-4 text-right">Validation Espèces</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let txn of transactions" class="hover:bg-gray-50/50">
                  <td class="p-4 font-mono font-bold text-gray-900 text-xs">{{ txn.transactionRef }}</td>
                  <td class="p-4 text-xs font-semibold text-gray-800">{{ txn.agency?.companyName || 'Agence' }}</td>
                  <td class="p-4 font-black text-blue-600">{{ txn.amount | number }} FCFA</td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                      {{ txn.paymentMethod }}
                    </span>
                  </td>
                  <td class="p-4">
                    <span [class]="txn.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                          class="px-2.5 py-0.5 text-xs font-bold rounded-full">
                      {{ txn.status === 'SUCCESS' ? 'Validé' : 'En Attente' }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <button *ngIf="txn.status === 'PENDING'" (click)="approveCash(txn.transactionRef)"
                            class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer">
                      Valider encaissement
                    </button>
                    <span *ngIf="txn.status === 'SUCCESS'" class="text-xs text-emerald-600 font-bold">✓ Encaissé</span>
                  </td>
                </tr>
                <tr *ngIf="transactions.length === 0">
                  <td colspan="6" class="p-8 text-center text-gray-400">Aucune transaction enregistrée.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Modal d'Inspection & Simulation des Pièces d'Identité (KYC) -->
    <div *ngIf="selectedKycAgency" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fade-in">
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🪪</span>
            <h3 class="text-lg font-black text-gray-900">Inspection CNI / Passeport KYC</h3>
          </div>
          <button (click)="selectedKycAgency = null" class="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs bg-gray-50 p-3 rounded-xl">
            <div>
              <span class="text-gray-400">Agence :</span> <strong>{{ selectedKycAgency.companyName }}</strong>
              <div class="text-gray-500">Responsable : {{ selectedKycAgency.fullName }}</div>
            </div>
            <div class="text-right font-mono">
              <div>NINEA : {{ selectedKycAgency.ninea }}</div>
              <div>RCCM : {{ selectedKycAgency.rccm }}</div>
            </div>
          </div>

          <!-- Document téléversé (CNI / Passeport) -->
          <div>
            <span class="block text-xs font-bold text-gray-700 uppercase mb-1.5">Document officiel téléversé :</span>
            <div class="h-64 w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
              <img [src]="selectedKycAgency.kycDocumentUrl || defaultCniMock" 
                   alt="Pièce d'identité CNI" 
                   class="w-full h-full object-contain" />
            </div>
            <p class="text-[11px] text-gray-400 mt-1 italic text-center">
              Vérifiez la concordance entre le nom du responsable et la pièce d'identité officielle.
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center pt-3 border-t">
          <button (click)="selectedKycAgency = null" class="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
            Fermer
          </button>
          <div class="flex gap-2">
            <button (click)="toggleVerify(selectedKycAgency); selectedKycAgency = null"
                    [class]="selectedKycAgency.verified ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'"
                    class="px-5 py-2 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm">
              {{ selectedKycAgency.verified ? 'Révoquer statut Vérifié' : '✓ Valider KYC & Attribuer Statut Vérifié' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardPageComponent implements OnInit {
  activeTab: 'agencies' | 'properties' | 'reports' | 'reviews' | 'payments' = 'agencies';

  agencies: any[] = [];
  properties: Property[] = [];
  reports: any[] = [];
  reviews: any[] = [];
  transactions: any[] = [];

  selectedKycAgency: any = null;
  readonly defaultCniMock = 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=800&q=80';

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadAgencies();
    this.loadProperties();
    this.loadReports();
    this.loadReviews();
    this.loadTransactions();
  }

  loadAgencies(): void {
    this.propertyService.getAllAgenciesAdmin().subscribe({
      next: (data) => {
        this.agencies = data;
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur chargement des agences.', 'error')
    });
  }

  loadProperties(): void {
    this.propertyService.getAllPropertiesAdmin().subscribe({
      next: (data) => {
        this.properties = data;
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur chargement des annonces.', 'error')
    });
  }

  loadReports(): void {
    this.propertyService.getAllReportsAdmin().subscribe({
      next: (data) => {
        this.reports = data;
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur chargement des signalements.', 'error')
    });
  }

  loadReviews(): void {
    this.propertyService.getAllReviewsAdmin().subscribe({
      next: (data) => {
        this.reviews = data;
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur chargement des avis.', 'error')
    });
  }

  loadTransactions(): void {
    this.propertyService.getAllTransactionsAdmin().subscribe({
      next: (data) => {
        this.transactions = data;
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur chargement des transactions.', 'error')
    });
  }

  openKycModal(agency: any): void {
    this.selectedKycAgency = agency;
  }

  toggleVerify(agency: any): void {
    const nextStatus = !agency.verified;
    this.propertyService.verifyAgency(agency.id, nextStatus).subscribe({
      next: (updated) => {
        agency.verified = updated.verified;
        this.toastService.show(
          updated.verified ? 'Statut « Agence vérifiée » attribué avec succès !' : 'Statut vérifié retiré.', 
          'success'
        );
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur lors de la modification de vérification.', 'error')
    });
  }

  toggleStatus(agency: any): void {
    const nextEnabled = !agency.enabled;
    this.propertyService.toggleAgencyStatus(agency.id, nextEnabled).subscribe({
      next: (updated) => {
        agency.enabled = updated.enabled;
        this.toastService.show(
          updated.enabled ? 'Agence réactivée.' : 'Agence suspendue avec succès.',
          'info'
        );
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur lors du changement de statut du compte.', 'error')
    });
  }

  deleteFraudulentProperty(property: Property): void {
    if (confirm(`Voulez-vous supprimer définitivement l'annonce frauduleuse "${property.title}" ?`)) {
      this.propertyService.deletePropertyAdmin(property.id).subscribe({
        next: () => {
          this.properties = this.properties.filter(p => p.id !== property.id);
          this.toastService.show('Annonce frauduleuse supprimée avec succès.', 'success');
          this.cdr.detectChanges();
        },
        error: () => this.toastService.show("Erreur lors de la suppression de l'annonce.", 'error')
      });
    }
  }

  resolveReport(item: any): void {
    this.propertyService.updateReportStatusAdmin(item.id, 'RESOLVED').subscribe({
      next: () => {
        item.status = 'RESOLVED';
        this.toastService.show('Signalement clôturé.', 'info');
        this.cdr.detectChanges();
      },
      error: () => this.toastService.show('Erreur lors de la clôture du signalement.', 'error')
    });
  }

  deleteReview(review: ReviewItem): void {
    if (confirm("Supprimer cet avis client ?")) {
      this.propertyService.deleteReviewAdmin(review.id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== review.id);
          this.toastService.show('Avis supprimé par l\'administrateur.', 'info');
          this.cdr.detectChanges();
        },
        error: () => this.toastService.show('Erreur lors de la suppression de l\'avis.', 'error')
      });
    }
  }

  approveCash(transactionRef: string): void {
    this.propertyService.approveCashPaymentAdmin(transactionRef).subscribe({
      next: (res) => {
        this.toastService.show(res.message, 'success');
        this.loadTransactions();
      },
      error: () => this.toastService.show("Erreur lors de la validation du paiement en espèces.", 'error')
    });
  }
}