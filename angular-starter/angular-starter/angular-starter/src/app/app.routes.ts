import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'properties',
    pathMatch: 'full'
  },
  {
    path: 'accueil',
    loadComponent: () => import('./features/home/pages/landing-page').then(m => m.LandingPageComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login-page').then(m => m.LoginPageComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register-page').then(m => m.RegisterPageComponent)
  },
  {
    path: 'properties',
    loadComponent: () => import('./features/home/pages/home-page').then(m => m.HomePageComponent)
  },
  {
    path: 'properties/:id',
    loadComponent: () => import('./features/properties/pages/property-detail/property-detail-page').then(m => m.PropertyDetailPageComponent)
  },
  {
    path: 'agencies/:id',
    loadComponent: () => import('./features/agency/pages/profile/agency-profile-page').then(m => m.AgencyProfilePageComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/properties/pages/favorites/favorites-page').then(m => m.FavoritesPageComponent),
    canActivate: [AuthGuard.isAuthenticated()]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/pages/notifications-page').then(m => m.NotificationsPageComponent),
    canActivate: [AuthGuard.isAuthenticated()]
  },
  {
    path: 'agency/dashboard',
    loadComponent: () => import('./features/agency/pages/dashboard/agency-dashboard-page').then(m => m.AgencyDashboardPageComponent),
    canActivate: [AuthGuard.hasRole('ROLE_AGENCY')]
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/pages/dashboard/admin-dashboard-page').then(m => m.AdminDashboardPageComponent),
    canActivate: [AuthGuard.hasRole('ROLE_ADMIN')]
  },
  { path: '**', redirectTo: 'properties' }
];