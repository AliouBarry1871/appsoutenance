// src/app/models/property.model.ts

export enum PropertyCategory {
  VILLA = 'VILLA',
  APPARTEMENT = 'APPARTEMENT',
  STUDIO = 'STUDIO',
  CHAMBRE = 'CHAMBRE',
  MAISON = 'MAISON',
  TERRAIN = 'TERRAIN',
  COMMERCIAL = 'COMMERCIAL',
  LOCAL_COMMERCIAL = 'LOCAL_COMMERCIAL'
}

export enum PropertyType {
  LOCATION = 'LOCATION',
  VENTE = 'VENTE'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  DISPONIBLE = 'DISPONIBLE',
  RENTED = 'RENTED',
  LOUE = 'LOUE',
  SOLD = 'SOLD',
  VENDU = 'VENDU',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface AgencyInfo {
  id?: number;
  name?: string;
  agencyName?: string;
  companyName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  telephone?: string;
  address?: string;
  verified?: boolean;
  profilePictureUrl?: string;
  kycDocumentUrl?: string;
  subscriptionStatus?: string;
  enabled?: boolean;
  ninea?: string;
  rccm?: string;
}

export interface PropertyImageItem {
  id?: number;
  imageUrl?: string;
  url?: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  depositPrice?: number;
  city: string;
  zone?: string;
  address: string;
  category: PropertyCategory | string;
  type?: PropertyType | string;
  transactionType?: PropertyType | string;
  status: PropertyStatus | string;
  images: (string | PropertyImageItem)[];

  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasAirConditioning?: boolean;
  hasParking?: boolean;

  agencyName?: string;
  agencyPhone?: string;
  agency?: AgencyInfo | null;
  isVerifiedAgency?: boolean;
  rooms?: number;
  surface?: number;
  area?: number;
  createdAt?: string;
}

export interface AgencyProfile {
  id: number;
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  ninea: string;
  rccm: string;
  verified: boolean;
  profilePictureUrl: string;
  subscriptionStatus: string;
  averageRating: number;
  totalReviews: number;
  activePropertiesCount: number;
}

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  client?: {
    id: number;
    fullName: string;
    email: string;
  };
  agency?: {
    id: number;
    companyName: string;
  };
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ALERT';
  readStatus: boolean;
  createdAt: string;
}