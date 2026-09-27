// src/app/core/constants/senegal-locations.constants.ts

/**
 * Liste complète et exhaustive des villes et communes du Sénégal
 * Couvrant les 14 régions du pays.
 */
export const SENEGAL_CITIES: string[] = [
  'Dakar',
  'Thiès',
  'Mbour / Saly',
  'Saint-Louis',
  'Touba',
  'Ziguinchor',
  'Kaolack',
  'Tambacounda',
  'Kolda',
  'Louga',
  'Fatick',
  'Kédougou',
  'Matam',
  'Sédhiou',
  'Kaffrine',
  'Rufisque',
  'Diamniadio',
  'Pikine',
  'Guédiawaye',
  'Tivaouane',
  'Mbacké',
  'Richard-Toll',
  'Diourbel',
  'Joal-Fadiouth',
  'Somone',
  'Ngaparou',
  'Popenguine',
  'Toubab Dialaw',
  'Bambey',
  'Kébémer',
  'Linguère',
  'Dahra',
  'Podor',
  'Dagana',
  'Ross Béthio',
  'Nioro du Rip',
  'Guinguinéo',
  'Koungheul',
  'Birkelane',
  'Bakel',
  'Goudiry',
  'Vélingara',
  'Bignona',
  'Oussouye',
  'Cap Skirring',
  'Kafountine',
  'Ourossogui',
  'Kanel',
  'Goudomp',
  'Bounkiling'
];

/**
 * Liste des quartiers et zones réputés au Sénégal (Dakar, Petite Côte, etc.)
 */
export const SENEGAL_ZONES: string[] = [
  // Dakar Centre & Ouest
  'Almadies',
  'Ngor',
  'Ouakam',
  'Mamelles',
  'Mermoz',
  'Fann Résidence',
  'Point E',
  'Dakar Plateau',
  'Médina',
  'Colobane',
  'Fass',
  'Gueule Tapée',
  'Grand Dakar',
  'Zone de Captage',
  'Sacré-Cœur 1',
  'Sacré-Cœur 2',
  'Sacré-Cœur 3',
  'Liberté 1',
  'Liberté 2',
  'Liberté 3',
  'Liberté 4',
  'Liberté 5',
  'Liberté 6',
  'Sicap Baobabs',
  'Sicap Amitié',
  'Dieuppeul',
  'Derklé',
  'HLM',
  'Yoff',
  'Yoff Tonghor',
  'Virage',
  'Nord Foire',
  'Ouest Foire',
  'Hann Maristes',
  'Grand Yoff',
  'Parcelles Assainies',
  'Cambérène',

  // Banlieue & Périphérie Dakar
  'Pikine',
  'Guédiawaye',
  'Keur Massar',
  'Rufisque Centre',
  'Rufisque Arafat',
  'Bargny',
  'Diamniadio',
  'Sébikotane',
  'Lac Rose',

  // Petite Côte & Régions
  'Saly Portudal',
  'Saly Golf',
  'Somone',
  'Ngaparou',
  'Toubab Dialaw',
  'Mbour Centre',
  'Pout',
  'Thiès Nord',
  'Thiès Sud',
  'Saint-Louis Île',
  'Saint-Louis Sor',
  'Cap Skirring Plage'
];

/**
 * Construit la requête d'adresse complète pour le géocodage et la navigation
 */
export function buildLocationQuery(
  address?: string | null,
  zone?: string | null,
  city?: string | null
): string {
  const parts: string[] = [];
  if (address && address.trim()) parts.push(address.trim());
  if (zone && zone.trim()) parts.push(zone.trim());
  if (city && city.trim()) parts.push(city.trim());
  parts.push('Sénégal');
  return parts.join(', ');
}

/**
 * Génère le lien Google Maps Directions (itinéraire GPS pas-à-pas)
 * depuis la position actuelle de l'utilisateur vers le bien
 */
export function getGoogleMapsDirectionsUrl(
  address?: string | null,
  zone?: string | null,
  city?: string | null
): string {
  const destination = buildLocationQuery(address, zone, city);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/**
 * Génère le lien Google Maps Search standard
 */
export function getGoogleMapsSearchUrl(
  address?: string | null,
  zone?: string | null,
  city?: string | null
): string {
  const query = buildLocationQuery(address, zone, city);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Génère l'URL d'intégration Iframe Google Maps (sans clé API requise)
 */
export function getGoogleMapsEmbedUrl(
  address?: string | null,
  zone?: string | null,
  city?: string | null
): string {
  const query = buildLocationQuery(address, zone, city);
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}
