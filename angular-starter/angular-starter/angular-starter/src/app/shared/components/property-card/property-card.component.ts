import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Property } from '../../../features/properties/models/property.model';
import { API_CONFIG } from '@core/config/api.config';
import { FormatEnumPipe } from '../../pipes/format-enum.pipe';
import { getGoogleMapsDirectionsUrl } from '../../../core/constants/senegal-locations.constants';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormatEnumPipe],
  template: `
    <div class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-blue-200 overflow-hidden group flex flex-col h-full">
      
      <!-- Photo principale & Badges -->
      <div class="relative h-56 w-full overflow-hidden bg-slate-100 shrink-0">
        <img [src]="getImageUrl(property)" 
             [alt]="property.title" 
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
             (error)="onImageError($event)" />
        
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

        <!-- Badges Catégorie et Type -->
        <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span class="bg-blue-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
            {{ property.category | formatEnum }}
          </span>
          <span [class]="getTransactionType() === 'VENTE' ? 'bg-emerald-600/90' : 'bg-indigo-600/90'"
                class="backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
            {{ getTransactionType() | formatEnum }}
          </span>
        </div>

        <!-- Badge Statut Disponibilité -->
        <div *ngIf="property.status && property.status !== 'AVAILABLE' && property.status !== 'DISPONIBLE'" 
             class="absolute top-3 right-3 bg-amber-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm uppercase z-10">
          {{ property.status | formatEnum }}
        </div>

        <!-- Prix en bas de la photo -->
        <div class="absolute bottom-3 left-3.5 right-3.5 flex items-baseline justify-between text-white z-10">
          <div>
            <span class="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">{{ property.price | number }}</span>
            <span class="text-xs font-semibold text-blue-200 ml-1">FCFA{{ getTransactionType() === 'LOCATION' ? ' / mois' : '' }}</span>
          </div>
          <span *ngIf="property.surface || property.area" class="text-xs font-medium text-slate-200 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {{ property.surface || property.area }} m²
          </span>
        </div>
      </div>

      <!-- Contenu et Détails -->
      <div class="p-5 flex flex-col flex-grow justify-between space-y-3.5">
        <div>
          <!-- Agence Immobilière Émettrice -->
          <div *ngIf="property.agencyName || property.agency?.companyName" class="flex items-center gap-1.5 mb-2 text-xs font-semibold text-blue-700 bg-blue-50/70 px-2.5 py-1 rounded-lg w-fit">
            <span>🏢 {{ property.agency?.companyName || property.agencyName }}</span>
            <span *ngIf="property.isVerifiedAgency || property.agency?.verified" class="text-blue-600 font-bold" title="Agence Contrôlée et Vérifiée">✓</span>
          </div>

          <!-- Titre Annonce -->
          <h3 class="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors leading-snug">
            {{ property.title }}
          </h3>

          <!-- Emplacement géographique -->
          <p class="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
            <span class="text-rose-500">📍</span>
            <span class="font-semibold text-slate-700">{{ property.city }}</span>
            <span *ngIf="property.zone" class="text-slate-400">• {{ property.zone }}</span>
          </p>

          <!-- Description tronquée -->
          <p class="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
            {{ property.description }}
          </p>
        </div>

        <!-- Caractéristiques et Équipements -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-3 text-xs text-slate-600">
            <span *ngIf="property.rooms" class="flex items-center gap-1 font-medium">
              <span>🛏️</span> {{ property.rooms }} pièces
            </span>
            <span *ngIf="property.hasParking" class="flex items-center gap-1 font-medium text-slate-500">
              <span>🅿️</span> Parking
            </span>
            <span *ngIf="property.hasAirConditioning" class="flex items-center gap-1 font-medium text-slate-500">
              <span>❄️</span> Clim
            </span>
          </div>

          <!-- Bouton Voir Détails & Localisation -->
          <div class="flex items-center gap-2">
            <a [routerLink]="['/properties', property.id]" 
               class="flex-1 text-center py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm transition-all duration-200 block cursor-pointer">
              Consulter le bien →
            </a>
            <a [href]="getDirectionsUrl()" target="_blank" rel="noopener noreferrer"
               (click)="$event.stopPropagation()"
               title="Localisation & Itinéraire GPS direct vers ce bien"
               class="py-2.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-2xs">
              <span>📍</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  `
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;

  private readonly defaultFallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  getDirectionsUrl(): string {
    if (!this.property) return '#';
    return getGoogleMapsDirectionsUrl(this.property.address, this.property.zone, this.property.city);
  }

  getTransactionType(): string {
    return String(this.property?.transactionType || this.property?.type || 'LOCATION');
  }

  getImageUrl(item: Property): string {
    if (item?.images && item.images.length > 0) {
      const img = item.images[0];
      const url = typeof img === 'string' ? img : (img as { imageUrl?: string; url?: string })?.imageUrl || (img as { imageUrl?: string; url?: string })?.url;
      
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
          return url;
        }
        const backendHost = API_CONFIG.baseUrl.split('/api')[0];
        return `${backendHost}${url.startsWith('/') ? '' : '/'}${url}`;
      }
    }
    return this.defaultFallback;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultFallback;
  }
}