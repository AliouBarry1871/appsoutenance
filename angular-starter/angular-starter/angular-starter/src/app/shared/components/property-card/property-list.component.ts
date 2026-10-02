import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../features/properties/services/property.service';
import { Property } from '../../../features/properties/models/property.model';
import { PropertyCardComponent } from './property-card.component';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- En-tête de la page -->
        <div class="text-center sm:text-left">
          <h1 class="text-3xl font-extrabold text-gray-900">Découvrez nos biens immobiliers</h1>
          <p class="mt-2 text-sm text-gray-600">Explorez les appartements, villas et terrains disponibles à Dakar et au Sénégal.</p>
        </div>

        <!-- Indicateur de chargement -->
        <div *ngIf="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Message en cas d'erreur -->
        <div *ngIf="errorMessage && !loading" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">
          {{ errorMessage }}
        </div>

        <!-- Grille responsive d'annonces -->
        <div *ngIf="!loading && !errorMessage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-property-card 
            *ngFor="let item of properties" 
            [property]="item">
          </app-property-card>
        </div>

        <!-- Message si aucun bien n'est trouvé -->
        <div *ngIf="!loading && !errorMessage && properties.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p class="text-gray-500 font-medium text-base">Aucun bien immobilier n'est disponible pour le moment.</p>
        </div>

      </div>
    </div>
  `
})
export class PropertyListComponent implements OnInit {
  properties: Property[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(filters?: any): void {
    this.loading = true;
    this.propertyService.getProperties(filters).subscribe({
      next: (data: Property[]) => {
        this.properties = (data || []).filter(p => !p.status || p.status === 'AVAILABLE' || p.status === 'DISPONIBLE');
        this.loading = false;
        this.cdr.detectChanges(); // 👈 Évite le blocage d'interface
      },
      error: (err: any) => {
        console.error('Erreur de chargement des biens:', err);
        this.errorMessage = 'Impossible de charger les annonces. Veuillez réessayer plus tard.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}