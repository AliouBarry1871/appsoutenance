import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Service & Modèles
import { PropertyService } from '../services/property.service';
import { PropertyCategory, PropertyType } from '../models/property.model';

// Core Services
import { ToastService } from '@core/services/toast.service';
import { SENEGAL_CITIES, SENEGAL_ZONES } from '../../../core/constants/senegal-locations.constants';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Publier une nouvelle annonce</h2>

        <form (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Titre & Catégorie -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Titre de l'annonce</label>
              <input type="text" [(ngModel)]="formData.title" name="title" required
                     placeholder="Ex: Bel Appartement F3 Moderne"
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
              <select [(ngModel)]="formData.category" name="category" required
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="APPARTEMENT">Appartement</option>
                <option value="MAISON">Maison</option>
                <option value="VILLA">Villa</option>
                <option value="CHAMBRE">Chambre</option>
                <option value="TERRAIN">Terrain</option>
                <option value="LOCAL_COMMERCIAL">Local Commercial</option>
              </select>
            </div>
          </div>

          <!-- Type, Prix, Caution -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Type de transaction</label>
              <select [(ngModel)]="formData.type" name="type" required
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="LOCATION">Location</option>
                <option value="VENTE">Vente</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Prix (FCFA)</label>
              <input type="number" [(ngModel)]="formData.price" name="price" required min="1"
                     placeholder="Ex: 350000"
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Caution (FCFA)</label>
              <input type="number" [(ngModel)]="formData.depositPrice" name="depositPrice" min="0"
                     placeholder="Ex: 700000"
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>

          <!-- Localisation -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Ville (Sénégal) *</label>
              <input type="text" [(ngModel)]="formData.city" name="city" list="propFormCities" required
                     placeholder="Ex: Dakar"
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <datalist id="propFormCities">
                <option *ngFor="let c of senegalCities" [value]="c"></option>
              </datalist>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Zone / Quartier</label>
              <input type="text" [(ngModel)]="formData.zone" name="zone" list="propFormZones"
                     placeholder="Ex: Colobane, Almadies, Mermoz..."
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <datalist id="propFormZones">
                <option *ngFor="let z of senegalZones" [value]="z"></option>
              </datalist>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Adresse exacte / Rue / Avenue *</label>
              <input type="text" [(ngModel)]="formData.address" name="address" required
                     placeholder="Ex: Avenue Cheikh Ahmadou Bamba"
                     class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          <p class="text-xs text-blue-700 -mt-3 flex items-center gap-1 font-medium bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
            <span>📍</span>
            <span>Cette adresse exacte permettra aux futurs acquéreurs ou locataires d'activer le guidage GPS direct vers la maison via le bouton Localisation.</span>
          </p>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea [(ngModel)]="formData.description" name="description" rows="4" required
                      placeholder="Description détaillée du bien..."
                      class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
          </div>

          <!-- Équipements -->
          <div class="flex flex-wrap gap-6">
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
              <input type="checkbox" [(ngModel)]="formData.hasBalcony" name="hasBalcony" class="w-4 h-4 text-blue-600 rounded" /> Balcon
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
              <input type="checkbox" [(ngModel)]="formData.hasAirConditioning" name="hasAirConditioning" class="w-4 h-4 text-blue-600 rounded" /> Climatisation
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
              <input type="checkbox" [(ngModel)]="formData.hasParking" name="hasParking" class="w-4 h-4 text-blue-600 rounded" /> Parking
            </label>
          </div>

          <!-- Téléversement des photos -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Photos du bien</label>
            <input type="file" (change)="onFileSelected($event)" multiple accept="image/*"
                   class="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            
            <div *ngIf="imagePreviews.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
              <div *ngFor="let preview of imagePreviews; let i = index" class="relative group h-24 rounded-lg overflow-hidden border border-gray-200">
                <img [src]="preview" class="w-full h-full object-cover" />
                <button type="button" (click)="removeImage(i)"
                        class="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer">
            {{ loading ? 'Publication en cours...' : 'Publier l\'annonce' }}
          </button>

        </form>
      </div>
    </div>
  `
})
export class PropertyFormComponent implements OnDestroy {
  readonly senegalCities = SENEGAL_CITIES;
  readonly senegalZones = SENEGAL_ZONES;

  formData = {
    title: '',
    category: 'APPARTEMENT' as PropertyCategory,
    type: 'LOCATION' as PropertyType,
    transactionType: 'LOCATION' as PropertyType,
    price: null as number | null,
    depositPrice: null as number | null,
    city: 'Dakar',
    zone: '',
    address: '',
    description: '',
    hasBalcony: false,
    hasAirConditioning: false,
    hasParking: false,
    status: 'AVAILABLE'
  };

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  loading = false;

  constructor(
    private propertyService: PropertyService, 
    private router: Router,
    private toastService: ToastService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file: File) => {
        this.selectedFiles.push(file);
        this.imagePreviews.push(URL.createObjectURL(file));
      });
    }
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.imagePreviews[index]);
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit(): void {
    if (!this.formData.title || !this.formData.price) {
      this.toastService.show('Veuillez remplir tous les champs obligatoires.', 'warning');
      return;
    }

    this.loading = true;
    const payload = new FormData();

    const jsonBlob = new Blob([JSON.stringify(this.formData)], { type: 'application/json' });
    payload.append('data', jsonBlob);

    this.selectedFiles.forEach((file) => {
      payload.append('images', file);
    });

    this.propertyService.createProperty(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.show('L\'annonce a été ajoutée avec succès !', 'success');
        this.router.navigate(['/properties']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur Backend:', err);
        if (err.status === 403) {
          this.toastService.show('Accès refusé : un compte Agence est requis.', 'error');
        } else {
          this.toastService.show('Erreur lors de la création de l\'annonce.', 'error');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.imagePreviews.forEach(url => URL.revokeObjectURL(url));
  }
}