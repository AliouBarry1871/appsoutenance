import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

/** Contrat renvoyé par le backend après authentification. */
export interface AuthResponse {
  token: string;
  role: string;
  email: string;
  fullName: string;
}

/** Données envoyées lors de l'inscription d'un compte agence ou client. */
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'ROLE_CLIENT' | 'ROLE_AGENCY';
  companyName?: string;
  ninea?: string;
  rccm?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(
    this.getUserFromStorage()
  );

  /** Observable public (lecture seule) de l'utilisateur connecté. */
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** Authentifie l'utilisateur et persiste le résultat en localStorage. */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap(res => this.saveUser(res)));
  }

  /** Crée un compte en envoyant soit un objet JSON, soit un FormData contennant les fichiers KYC. */
  register(payload: RegisterPayload | FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap(res => this.saveUser(res)));
  }

  /** Déconnecte l'utilisateur et vide le localStorage. */
  logout(): void {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  /** Retourne le JWT stocké, ou null si non connecté. */
  getToken(): string | null {
    const userToken = this.getUserFromStorage()?.token;
    if (userToken) return userToken;
    return localStorage.getItem('token') ?? null;
  }

  /** Vérifie si un token JWT est expiré. */
  isTokenExpired(token?: string | null): boolean {
    const jwt = token ?? this.getToken();
    if (!jwt) return true;

    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) return true;
      // Décodage base64 compatible URL
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      if (!payload.exp) return false;
      // exp est en secondes, Date.now() en millisecondes
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /** Retourne true si un utilisateur est actuellement connecté avec un token valide. */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }

    return true;
  }

  private saveUser(user: AuthResponse): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
    if (user.token) {
      localStorage.setItem('token', user.token);
    }
    this.currentUserSubject.next(user);
  }

  private getUserFromStorage(): AuthResponse | null {
    try {
      const data = localStorage.getItem('auth_user');
      return data ? (JSON.parse(data) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}