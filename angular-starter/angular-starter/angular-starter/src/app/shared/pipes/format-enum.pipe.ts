import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatEnum',
  standalone: true
})
export class FormatEnumPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';

    const translations: { [key: string]: string } = {
      // Statuts
      'AVAILABLE': 'Disponible',
      'DISPONIBLE': 'Disponible',
      'RENTED': 'Loué',
      'LOUE': 'Loué',
      'SOLD': 'Vendu',
      'VENDU': 'Vendu',
      'PENDING': 'En attente',
      'UNAVAILABLE': 'Indisponible',
      'INACTIVE': 'Inactif',
      'ACTIVE': 'Actif',
      'EXPIRED': 'Expiré',

      // Type de transaction
      'RENT': 'Location',
      'LOCATION': 'Location',
      'SALE': 'Vente',
      'VENTE': 'Vente',

      // Catégories / Types de biens
      'APARTMENT': 'Appartement',
      'APPARTEMENT': 'Appartement',
      'HOUSE': 'Maison',
      'MAISON': 'Maison',
      'VILLA': 'Villa',
      'STUDIO': 'Studio',
      'CHAMBRE': 'Chambre',
      'OFFICE': 'Bureau',
      'LAND': 'Terrain',
      'TERRAIN': 'Terrain',
      'COMMERCIAL': 'Local Commercial',
      'LOCAL_COMMERCIAL': 'Local Commercial',

      // Raisons de signalement
      'SPAM': 'Spam / Doublon',
      'INAPPROPRIATE_CONTENT': 'Contenu inapproprié',
      'MISLEADING_PRICE': 'Prix trompeur',
      'FAKE_LISTING': 'Annonce frauduleuse',
      'OTHER': 'Autre'
    };

    return translations[value.toUpperCase()] || value;
  }
}