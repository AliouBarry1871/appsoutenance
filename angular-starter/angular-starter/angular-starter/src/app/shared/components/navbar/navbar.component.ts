import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../features/properties/services/property.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-18">
          
          <!-- Logo & Marque -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/" class="text-2xl font-black tracking-tight flex items-center gap-2 group">
              <span class="text-slate-900 group-hover:text-blue-600 transition-colors">Sama<span class="text-blue-600">Keur</span></span>
              <span class="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60 font-bold px-2 py-0.5 rounded-full hidden sm:inline tracking-wider uppercase">Sénégal 🇸🇳</span>
            </a>
          </div>

          <!-- Liens de navigation centraux (Desktop) -->
          <div class="hidden md:flex items-center gap-2">
            <a routerLink="/accueil" 
               routerLinkActive="bg-blue-50 text-blue-600 font-bold"
               class="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-1.5">
              <span>🏠</span>
              <span>Accueil</span>
            </a>

            <a routerLink="/properties" 
               routerLinkActive="bg-blue-50 text-blue-600 font-bold"
               class="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-1.5">
              <span>🔍</span>
              <span>Toutes les annonces</span>
            </a>

            <!-- Lien Favoris réservé aux clients connectés -->
            <a *ngIf="(currentUser$ | async)?.role === 'ROLE_CLIENT'"
               routerLink="/favorites" 
               routerLinkActive="bg-rose-50 text-rose-600 font-bold"
               class="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-1.5">
              <span>❤️</span>
              <span>Mes Favoris</span>
            </a>
            
            <!-- Lien Espace Agence -->
            <a *ngIf="(currentUser$ | async)?.role === 'ROLE_AGENCY'" 
               routerLink="/agency/dashboard" 
               routerLinkActive="bg-blue-50 text-blue-600 font-bold"
               class="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5">
              <span>🏢</span>
              <span>Tableau de Bord Agence</span>
            </a>

            <!-- Lien Espace Admin -->
            <a *ngIf="(currentUser$ | async)?.role === 'ROLE_ADMIN'" 
               routerLink="/admin/dashboard" 
               routerLinkActive="bg-purple-50 text-purple-600 font-bold"
               class="px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Administration</span>
            </a>
          </div>

          <!-- Zone Utilisateur / Actions (Desktop) -->
          <div class="hidden md:flex items-center gap-3">
            <ng-container *ngIf="currentUser$ | async as user; else guest">
              
              <!-- Cloche Notifications -->
              <a routerLink="/notifications" 
                 class="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition rounded-xl"
                 title="Notifications">
                <span class="text-xl leading-none">🔔</span>
                <span *ngIf="unreadCount > 0" 
                      class="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </a>

              <!-- Profil utilisateur connecté -->
              <div class="flex items-center gap-2.5 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200/80">
                <div class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center uppercase shadow-xs">
                  {{ user.fullName ? user.fullName.charAt(0) : 'U' }}
                </div>
                <span class="text-xs font-bold text-slate-800 max-w-[140px] truncate">
                  {{ user.fullName || user.email }}
                </span>
              </div>

              <!-- Bouton Déconnexion -->
              <button type="button" 
                      (click)="logout()" 
                      class="px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50/60 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer">
                Déconnexion
              </button>
            </ng-container>

            <ng-template #guest>
              <a routerLink="/login" 
                 class="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                Connexion
              </a>
              <a routerLink="/register" 
                 class="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all">
                S'inscrire
              </a>
            </ng-template>
          </div>

          <!-- Bouton Menu Mobile (Hamburger) -->
          <div class="flex items-center gap-2 md:hidden">
            <a *ngIf="currentUser$ | async" routerLink="/notifications" class="relative p-2 text-slate-600">
              <span class="text-xl">🔔</span>
              <span *ngIf="unreadCount > 0" class="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {{ unreadCount }}
              </span>
            </a>
            <button (click)="mobileMenuOpen = !mobileMenuOpen" 
                    class="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer">
              <span class="text-2xl leading-none">{{ mobileMenuOpen ? '✕' : '☰' }}</span>
            </button>
          </div>

        </div>

        <!-- Menu Déroulant Mobile -->
        <div *ngIf="mobileMenuOpen" class="md:hidden py-4 border-t border-slate-100 space-y-2">
          <a routerLink="/accueil" (click)="mobileMenuOpen = false" 
             class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            🏠 Accueil
          </a>

          <a routerLink="/properties" (click)="mobileMenuOpen = false" 
             class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            🔍 Toutes les annonces
          </a>

          <a *ngIf="(currentUser$ | async)?.role === 'ROLE_CLIENT'" 
             routerLink="/favorites" (click)="mobileMenuOpen = false" 
             class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors">
            ❤️ Mes Favoris
          </a>

          <a *ngIf="(currentUser$ | async)?.role === 'ROLE_AGENCY'" 
             routerLink="/agency/dashboard" (click)="mobileMenuOpen = false" 
             class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            🏢 Mon Espace Agence
          </a>

          <a *ngIf="(currentUser$ | async)?.role === 'ROLE_ADMIN'" 
             routerLink="/admin/dashboard" (click)="mobileMenuOpen = false" 
             class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
            🛡️ Espace Administration
          </a>

          <div class="pt-3 border-t border-slate-100">
            <ng-container *ngIf="currentUser$ | async as user; else mobileGuest">
              <div class="px-3 py-2 text-xs text-slate-500">
                Connecté en tant que : <strong class="text-slate-800">{{ user.fullName || user.email }}</strong>
              </div>
              <button (click)="logout(); mobileMenuOpen = false" 
                      class="w-full text-left px-3.5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                Se déconnecter
              </button>
            </ng-container>
            <ng-template #mobileGuest>
              <div class="grid grid-cols-2 gap-2 px-2 pt-2">
                <a routerLink="/login" (click)="mobileMenuOpen = false" class="text-center py-2.5 text-xs font-bold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
                  Connexion
                </a>
                <a routerLink="/register" (click)="mobileMenuOpen = false" class="text-center py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-xs hover:bg-blue-700">
                  S'inscrire
                </a>
              </div>
            </ng-template>
          </div>
        </div>

      </div>
    </nav>
  `
})
export class NavbarComponent implements OnInit {
  readonly currentUser$;
  mobileMenuOpen = false;
  unreadCount = 0;

  constructor(
    private authService: AuthService, 
    private propertyService: PropertyService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe((user) => {
      if (user) {
        this.propertyService.getUnreadCount().subscribe({
          next: (res: { unreadCount: number }) => this.unreadCount = res.unreadCount,
          error: () => this.unreadCount = 0
        });
      } else {
        this.unreadCount = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}