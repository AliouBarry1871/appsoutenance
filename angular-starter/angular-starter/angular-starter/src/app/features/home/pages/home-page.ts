import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService, PropertyFilters } from '../../properties/services/property.service';
import { Property, PropertyCategory, PropertyType } from '../../properties/models/property.model';
import { PropertyCardComponent } from '../../../shared/components/property-card/property-card.component';
import { SENEGAL_CITIES, SENEGAL_ZONES } from '../../../core/constants/senegal-locations.constants';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent],
  template: `
    <div class="min-h-screen bg-slate-50 pb-20">
      
      <!-- Hero Header & Recherche au Sénégal avec Arrière-plan Maison de Prestige -->
      <div class="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-slate-900 min-h-[480px] flex items-center justify-center">
        
        <!-- Arrière-plan : Superbe villa contemporaine lumineuse et haut de gamme (distincte de la page d'accueil) -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80"
               alt="Superbe villa contemporaine de prestige"
               class="w-full h-full object-cover object-center" />
          
          <!-- Voile neutre ultra-léger (aucun filtre bleu) pour garantir la lisibilité parfaite des textes tout en sublimant la maison -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/65"></div>
        </div>

        <div class="max-w-5xl mx-auto text-center space-y-6 relative z-10">

          <!-- Titre Principal Accrocheur -->
          <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Trouvez le logement idéal au <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">Sénégal</span>
          </h1>

          <p class="text-white text-sm sm:text-base max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] font-semibold">
            Villas de prestige, appartements meublés, studios et terrains vérifiés à Dakar, Saly, Thiès et dans tout le pays. Échangez directement avec des professionnels certifiés.
          </p>

          <!-- Boîte de Recherche & Filtres Multi-critères -->
          <div class="mt-8 bg-white p-5 sm:p-7 rounded-3xl shadow-2xl text-slate-800 space-y-5 border border-slate-100">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              
              <!-- Ville (Toutes les villes du Sénégal) -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>🏙️</span> Ville
                </label>
                <select [(ngModel)]="filters.city" (change)="onFilterChange()"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition">
                  <option value="">Toutes les villes (Sénégal)</option>
                  <option *ngFor="let c of senegalCities" [value]="c">{{ c }}</option>
                </select>
              </div>

              <!-- Zone / Quartier -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>📍</span> Quartier / Zone
                </label>
                <select [(ngModel)]="filters.zone" (change)="onFilterChange()"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition">
                  <option value="">Tous les quartiers</option>
                  <option *ngFor="let z of senegalZones" [value]="z">{{ z }}</option>
                </select>
              </div>

              <!-- Catégorie de Bien -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>🏠</span> Catégorie
                </label>
                <select [(ngModel)]="filters.category" (change)="onFilterChange()"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition">
                  <option value="">Toutes les catégories</option>
                  <option value="VILLA">Villa</option>
                  <option value="APPARTEMENT">Appartement</option>
                  <option value="STUDIO">Studio</option>
                  <option value="CHAMBRE">Chambre</option>
                  <option value="MAISON">Maison</option>
                  <option value="TERRAIN">Terrain</option>
                  <option value="COMMERCIAL">Local Commercial</option>
                </select>
              </div>

              <!-- Type de Transaction -->
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>🏷️</span> Opération
                </label>
                <select [(ngModel)]="filters.type" (change)="onFilterChange()"
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition">
                  <option value="">Toutes (Location & Vente)</option>
                  <option value="LOCATION">Location</option>
                  <option value="VENTE">Vente</option>
                </select>
              </div>

            </div>

            <!-- Filtre Budget & Actions -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <span class="text-xs font-bold text-slate-500 uppercase">Budget max :</span>
                <div class="relative flex-grow sm:flex-grow-0">
                  <input type="number" [(ngModel)]="filters.maxPrice" (input)="onFilterChange()" placeholder="Ex: 500 000"
                         class="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none w-full sm:w-48 pr-14">
                  <span class="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">FCFA</span>
                </div>
              </div>

              <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button (click)="resetFilters()" 
                        class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer">
                  Effacer les filtres
                </button>
              </div>
            </div>

          </div>

          <!-- Raccourcis de recherche populaire -->
          <div class="flex items-center justify-center gap-2 flex-wrap text-xs text-white/90 pt-1">
            <span class="font-medium text-slate-200">Recherches fréquentes :</span>
            <button (click)="quickFilterZone('Colobane')" class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition cursor-pointer font-semibold shadow-xs">Colobane</button>
            <button (click)="quickFilterZone('Almadies')" class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition cursor-pointer font-semibold shadow-xs">Almadies</button>
            <button (click)="quickFilterZone('Mermoz')" class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition cursor-pointer font-semibold shadow-xs">Mermoz</button>
            <button (click)="quickFilterZone('Saly Portudal')" class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition cursor-pointer font-semibold shadow-xs">Saly</button>
            <button (click)="quickFilterCategory('VILLA')" class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition cursor-pointer font-semibold shadow-xs">Villas</button>
            <button (click)="quickFilterCategory('STUDIO')" class="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition cursor-pointer font-semibold shadow-xs">Studios</button>
          </div>

        </div>
      </div>

      <!-- Statistiques Rapides de la Plateforme -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl shadow-md border border-slate-100 p-5 text-center transition-transform hover:-translate-y-1">
            <div class="text-3xl font-black text-blue-600">{{ totalProperties }}</div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Annonces actives</div>
          </div>
          <div class="bg-white rounded-2xl shadow-md border border-slate-100 p-5 text-center transition-transform hover:-translate-y-1">
            <div class="text-3xl font-black text-emerald-600">{{ verifiedAgencies }}</div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Agences vérifiées</div>
          </div>
          <div class="bg-white rounded-2xl shadow-md border border-slate-100 p-5 text-center transition-transform hover:-translate-y-1">
            <div class="text-3xl font-black text-indigo-600">{{ locationCount }}</div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Biens en location</div>
          </div>
          <div class="bg-white rounded-2xl shadow-md border border-slate-100 p-5 text-center transition-transform hover:-translate-y-1">
            <div class="text-3xl font-black text-amber-600">{{ venteCount }}</div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Biens en vente</div>
          </div>
        </div>
      </div>

      <!-- Section Annonces Principales -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
        
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Toutes les annonces disponibles</h2>
            <p class="text-xs text-slate-500 mt-1">Directement auprès d'agences vérifiées avec contact instantané</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {{ properties.length }} bien(s) répertorié(s)
          </span>
        </div>

        <!-- Indicateur de Chargement Moderne -->
        <div *ngIf="loading" class="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-3 text-slate-600 text-sm font-semibold">Chargement des biens immobiliers...</p>
        </div>

        <!-- Grille des cartes immobilières -->
        <div *ngIf="!loading && properties.length > 0" 
             class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <app-property-card *ngFor="let item of properties" [property]="item"></app-property-card>
        </div>

        <!-- Aucun résultat -->
        <div *ngIf="!loading && properties.length === 0" 
             class="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-lg mx-auto space-y-4">
          <div class="text-5xl">🔎</div>
          <h3 class="text-lg font-bold text-slate-900">Aucune annonce ne correspond à ces critères</h3>
          <p class="text-xs text-slate-500 leading-relaxed">Modifiez votre sélection géographique ou budgétaire pour découvrir les opportunités disponibles.</p>
          <button (click)="resetFilters()" 
                  class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer">
            Voir toutes les annonces
          </button>
        </div>

      </div>

      <!-- Section Garanties & Valeurs de SamaKeur -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
          <div class="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span class="text-xs font-bold text-blue-600 uppercase tracking-widest">Sérénité & Transparence</span>
            <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Pourquoi chercher sur SamaKeur ?</h2>
            <p class="text-xs sm:text-sm text-slate-500">Une plateforme conçue pour protéger les chercheurs de logement au Sénégal contre les arnaques.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl mx-auto">
                🛡️
              </div>
              <h3 class="text-base font-bold text-slate-900">Agences 100% Vérifiées</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Toutes nos agences partenaires soumettent leurs documents légaux (NINEA, RCCM) vérifiés rigoureusement avant publication.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                💬
              </div>
              <h3 class="text-base font-bold text-slate-900">Contact Direct WhatsApp</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Pas de commission cachée ni d'intermédiaires fantômes. Vous contactez directement l'agent responsable en un clic.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl mx-auto">
                📍
              </div>
              <h3 class="text-base font-bold text-slate-900">Expertise Locale Sénégalaise</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Recherche ciblée par quartier à Dakar (Almadies, Mermoz, Plateau...) et dans les grandes zones côtières et économiques.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class HomePageComponent implements OnInit {
  properties: Property[] = [];
  loading = true;

  // Villes et Quartiers complets du Sénégal
  readonly senegalCities = SENEGAL_CITIES;
  readonly senegalZones = SENEGAL_ZONES;

  // Statistiques de la plateforme
  totalProperties = 0;
  verifiedAgencies = 0;
  locationCount = 0;
  venteCount = 0;

  filters: PropertyFilters = {
    city: '',
    zone: '',
    category: '',
    type: '',
    maxPrice: undefined
  };

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadStats();
  }

  loadStats(): void {
    this.propertyService.getAllAgencies().subscribe({
      next: (agencies) => {
        this.verifiedAgencies = (agencies || []).filter((a: any) => a.verified).length;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  loadProperties(): void {
    this.loading = true;
    this.cdr.detectChanges();

    // Nettoyage des filtres pour éviter d'envoyer des chaînes vides
    const activeFilters: PropertyFilters = {};
    if (this.filters.city && this.filters.city.trim() !== '') activeFilters.city = this.filters.city.trim();
    if (this.filters.zone && this.filters.zone.trim() !== '') activeFilters.zone = this.filters.zone.trim();
    if (this.filters.category && this.filters.category.trim() !== '') activeFilters.category = this.filters.category.trim();
    if (this.filters.type && this.filters.type.trim() !== '') activeFilters.type = this.filters.type.trim();
    if (this.filters.maxPrice && this.filters.maxPrice > 0) activeFilters.maxPrice = this.filters.maxPrice;

    this.propertyService.getProperties(activeFilters).subscribe({
      next: (data) => {
        this.properties = data || [];
        this.totalProperties = this.properties.length;
        this.locationCount = this.properties.filter(p => (p.transactionType || p.type) === 'LOCATION').length;
        this.venteCount = this.properties.filter(p => (p.transactionType || p.type) === 'VENTE').length;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement annonces:', err);
        this.properties = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(): void {
    this.loadProperties();
  }

  quickFilterZone(zoneName: string): void {
    this.filters.zone = zoneName;
    this.loadProperties();
  }

  quickFilterCategory(catName: string): void {
    this.filters.category = catName;
    this.loadProperties();
  }

  resetFilters(): void {
    this.filters = { city: '', zone: '', category: '', type: '', maxPrice: undefined };
    this.loadProperties();
  }
}