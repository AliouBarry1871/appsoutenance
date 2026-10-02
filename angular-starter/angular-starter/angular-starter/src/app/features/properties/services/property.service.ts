import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property, PropertyStatus, PropertyType, AgencyProfile, ReviewItem, NotificationItem } from '../models/property.model';
import { API_CONFIG } from '../../../core/config/api.config';

export interface PropertyFilters {
  city?: string;
  zone?: string;
  category?: string;
  maxPrice?: number;
  type?: PropertyType | string;
  status?: PropertyStatus | string;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/properties`;
  private readonly agenciesUrl = `${API_CONFIG.baseUrl}/agencies`;
  private readonly reviewsUrl = `${API_CONFIG.baseUrl}/reviews`;
  private readonly favoritesUrl = `${API_CONFIG.baseUrl}/favorites`;
  private readonly notificationsUrl = `${API_CONFIG.baseUrl}/notifications`;
  private readonly paymentsUrl = `${API_CONFIG.baseUrl}/payments`;
  private readonly adminUrl = `${API_CONFIG.baseUrl}/admin`;
  private readonly reportsUrl = `${API_CONFIG.baseUrl}/reports`;

  constructor(private http: HttpClient) {}

  // --- Propriétés ---

  getProperties(filters?: PropertyFilters): Observable<Property[]> {
    let params = new HttpParams();
    if (filters?.city) params = params.set('city', filters.city);
    if (filters?.zone) params = params.set('zone', filters.zone);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.maxPrice) params = params.set('maxPrice', String(filters.maxPrice));
    if (filters?.type) params = params.set('type', String(filters.type));
    if (filters?.status) params = params.set('status', String(filters.status));

    return this.http.get<Property[]>(this.apiUrl, { params });
  }

  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/my-properties`);
  }

  getPropertyById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  getPropertiesByAgencyId(agencyId: number): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/agency/${agencyId}`);
  }

  createProperty(data: FormData | Partial<Property>): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data);
  }

  updateProperty(id: number, data: Partial<Property>): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, data);
  }

  updatePropertyMultipart(id: number, data: Partial<Property>, images?: File[]): Observable<Property> {
    const formData = new FormData();
    const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append('data', jsonBlob);

    if (images && images.length > 0) {
      images.forEach((file) => formData.append('images', file));
    }

    return this.http.put<Property>(`${this.apiUrl}/${id}`, formData);
  }

  updateStatus(id: number, status: PropertyStatus | string): Observable<Property> {
    const params = new HttpParams().set('status', String(status));
    return this.http.patch<Property>(`${this.apiUrl}/${id}/status`, {}, { params });
  }

  updatePropertyStatus(id: number, status: PropertyStatus | string): Observable<Property> {
    return this.updateStatus(id, status);
  }

  reserveProperty(id: number, data: { clientFullName: string; clientPhone: string; message?: string }): Observable<Property> {
    return this.http.post<Property>(`${this.apiUrl}/${id}/reserve`, data);
  }

  deleteProperty(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- Profils Agences & Avis ---

  getAllAgencies(): Observable<AgencyProfile[]> {
    return this.http.get<AgencyProfile[]>(this.agenciesUrl);
  }

  getAgencyProfile(agencyId: number): Observable<AgencyProfile> {
    return this.http.get<AgencyProfile>(`${this.agenciesUrl}/${agencyId}`);
  }

  getAgencyReviews(agencyId: number): Observable<ReviewItem[]> {
    return this.http.get<ReviewItem[]>(`${this.reviewsUrl}/agency/${agencyId}`);
  }

  getMyAgencyReviews(): Observable<ReviewItem[]> {
    return this.http.get<ReviewItem[]>(`${this.reviewsUrl}/my-agency`);
  }

  addReview(agencyId: number, rating: number, comment: string): Observable<ReviewItem> {
    return this.http.post<ReviewItem>(this.reviewsUrl, { agencyId, rating, comment });
  }

  // --- Favoris ---

  getFavorites(): Observable<Property[]> {
    return this.http.get<Property[]>(this.favoritesUrl);
  }

  addFavorite(propertyId: number): Observable<string> {
    return this.http.post(
      `${this.favoritesUrl}/${propertyId}`,
      {},
      { responseType: 'text' }
    );
  }

  removeFavorite(propertyId: number): Observable<string> {
    return this.http.delete(
      `${this.favoritesUrl}/${propertyId}`,
      { responseType: 'text' }
    );
  }

  checkIsFavorite(propertyId: number): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.favoritesUrl}/check/${propertyId}`);
  }

  // --- Signalements ---

  reportProperty(propertyId: number, reason: string, description: string): Observable<any> {
    return this.http.post(this.reportsUrl, { propertyId, reason, description });
  }

  // --- Notifications ---

  getNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(this.notificationsUrl);
  }

  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.notificationsUrl}/unread-count`);
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.notificationsUrl}/${id}/read`, {});
  }

  markAllNotificationsAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.notificationsUrl}/read-all`, {});
  }

  // --- Abonnements & Paiements ---

  initiatePayment(amount: number, paymentMethod: string): Observable<any> {
    return this.http.post(`${this.paymentsUrl}/initiate`, { amount, paymentMethod });
  }

  simulatePaymentSuccess(transactionRef: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.paymentsUrl}/simulate-success/${transactionRef}`, {});
  }

  getMyTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.paymentsUrl}/my-transactions`);
  }

  // --- Administration ---

  getAllAgenciesAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/agencies`);
  }

  verifyAgency(id: number, verified: boolean): Observable<any> {
    const params = new HttpParams().set('verified', String(verified));
    return this.http.patch(`${this.adminUrl}/agencies/${id}/verify`, {}, { params });
  }

  toggleAgencyStatus(id: number, enabled: boolean): Observable<any> {
    const params = new HttpParams().set('enabled', String(enabled));
    return this.http.patch(`${this.adminUrl}/agencies/${id}/status`, {}, { params });
  }

  updateSubscriptionManually(id: number, status: string): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.patch(`${this.adminUrl}/agencies/${id}/subscription`, {}, { params });
  }

  getAllPropertiesAdmin(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.adminUrl}/properties`);
  }

  deletePropertyAdmin(id: number): Observable<string> {
    return this.http.delete(`${this.adminUrl}/properties/${id}`, { responseType: 'text' });
  }

  getAllReportsAdmin(): Observable<any[]> {
    return this.http.get<any[]>(this.reportsUrl);
  }

  updateReportStatusAdmin(id: number, status: string): Observable<any> {
    const params = new HttpParams().set('status', status);
    return this.http.patch(`${this.reportsUrl}/${id}/status`, {}, { params });
  }

  getAllReviewsAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.adminUrl}/reviews`);
  }

  deleteReviewAdmin(id: number): Observable<string> {
    return this.http.delete(`${this.adminUrl}/reviews/${id}`, { responseType: 'text' });
  }

  getAllTransactionsAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.paymentsUrl}/all`);
  }

  approveCashPaymentAdmin(transactionRef: string): Observable<any> {
    return this.http.patch(`${this.paymentsUrl}/approve-cash/${transactionRef}`, {});
  }
}