import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../../services/property.service';
import { ToastService } from '@core/services/toast.service';
import { Property } from '../../../models/property.model';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="property" class="space-y-4">
      <h3 class="text-lg font-bold text-gray-900">Modifier l'annonce</h3>
      <form (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase">Titre</label>
          <input type="text" [(ngModel)]="property.title" name="title" required
                 class="w-full border rounded-lg p-2 text-sm">
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-700 uppercase">Prix (FCFA)</label>
          <input type="number" [(ngModel)]="property.price" name="price" required
                 class="w-full border rounded-lg p-2 text-sm">
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" (click)="cancel.emit()" class="px-4 py-2 border rounded-lg text-sm">Annuler</button>
          <button type="submit" [disabled]="isSubmitting" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer disabled:opacity-50">
            {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </form>
    </div>
  `
})
export class PropertyEditComponent {
  @Input() property?: Property;
  @Output() cancel = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Property>();

  isSubmitting = false;

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    if (!this.property?.id) return;
    this.isSubmitting = true;
    this.propertyService.updateProperty(this.property.id, this.property).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        this.toastService.show('Modifications enregistrées avec succès !', 'success');
        this.saved.emit(updated);
      },
      error: () => {
        this.isSubmitting = false;
        this.toastService.show('Échec de la modification du bien', 'error');
      }
    });
  }
}