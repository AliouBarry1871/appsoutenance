import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/property.model';
import { ToastService } from '../../../../core/services/toast.service';
import { PropertyCardComponent } from '../../../../shared/components/property-card/property-card.component';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- En-tête -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">❤️</span>
              <h1 class="text-2xl font-extrabold text-gray-900">Mes Annonces Favorites</h1>
            </div>
            <p class="text-sm text-gray-500 mt-1">Retrouvez les biens immobiliers que vous avez sauvegardés.</p>
          </div>
          <a routerLink="/properties" class="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm rounded-xl transition">
            + Parcourir d'autres annonces
          </a>
        </div>

        <!-- Chargement -->
        <div *ngIf="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-2 text-gray-500 text-sm">Chargement de vos favoris...</p>
        </div>

        <!-- Grille des favoris -->
        <div *ngIf="!loading && favorites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div *ngFor="let item of favorites" class="relative group">
            <app-property-card [property]="item"></app-property-card>
            <button (click)="removeFavorite(item.id)" 
                    title="Retirer des favoris"
                    class="absolute top-2 right-2 z-10 p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-md transition hover:scale-110 cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        <!-- Aucun favori -->
        <div *ngIf="!loading && favorites.length === 0" 
             class="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-lg mx-auto space-y-4">
          <div class="text-5xl">🤍</div>
          <h2 class="text-xl font-bold text-gray-900">Vous n'avez aucun favori pour le moment</h2>
          <p class="text-sm text-gray-500 leading-relaxed">
            Lorsque vous consultez une annonce qui vous intéresse, cliquez sur le bouton "Ajouter aux favoris" pour la retrouver facilement ici.
          </p>
          <a routerLink="/properties" class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition">
            Explorer les annonces disponibles
          </a>
        </div>

      </div>
    </div>
  `
})
export class FavoritesPageComponent implements OnInit {
  favorites: Property[] = [];
  loading = true;

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.propertyService.getFavorites().subscribe({
      next: (data) => {
        this.favorites = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur récupération favoris :', err);
        this.favorites = [];
        this.loading = false;
        this.cdr.detectChanges();
        const msg = err.error?.message || 'Impossible de récupérer vos favoris.';
        this.toastService.show(msg, 'error');
      }
    });
  }

  removeFavorite(propertyId: number): void {
    this.propertyService.removeFavorite(propertyId).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.id !== propertyId);
        this.toastService.show('Annonce retirée de vos favoris.', 'info');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastService.show('Erreur lors du retrait du favori.', 'error');
        this.cdr.detectChanges();
      }
    });
  }
}
