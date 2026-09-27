import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../properties/services/property.service';
import { NotificationItem } from '../../properties/models/property.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-6">
        
        <!-- En-tête -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">🔔</span>
              <h1 class="text-2xl font-extrabold text-gray-900">Centre de Notifications</h1>
            </div>
            <p class="text-sm text-gray-500 mt-1">Vos alertes d'annonces, activités et informations de compte.</p>
          </div>
          <button *ngIf="notifications.length > 0" (click)="markAllAsRead()"
                  class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition cursor-pointer">
            Tout marquer comme lu
          </button>
        </div>

        <!-- Chargement -->
        <div *ngIf="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-2 text-gray-500 text-sm">Chargement des notifications...</p>
        </div>

        <!-- Liste des notifications -->
        <div *ngIf="!loading && notifications.length > 0" class="space-y-3">
          <div *ngFor="let notif of notifications" 
               (click)="markAsRead(notif)"
               [class]="notif.readStatus ? 'bg-white opacity-80' : 'bg-blue-50/60 border-l-4 border-l-blue-600 font-medium shadow-sm'"
               class="p-5 rounded-xl border border-gray-100 transition hover:shadow-md cursor-pointer flex items-start gap-4">
            
            <div class="p-2.5 rounded-xl shrink-0" 
                 [ngClass]="{
                   'bg-blue-100 text-blue-700': notif.type === 'INFO',
                   'bg-emerald-100 text-emerald-700': notif.type === 'SUCCESS',
                   'bg-amber-100 text-amber-700': notif.type === 'ALERT'
                 }">
              <span *ngIf="notif.type === 'INFO'">ℹ️</span>
              <span *ngIf="notif.type === 'SUCCESS'">🎉</span>
              <span *ngIf="notif.type === 'ALERT'">⚠️</span>
            </div>

            <div class="flex-grow space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-gray-900">{{ notif.title }}</h3>
                <span class="text-xs text-gray-400">{{ notif.createdAt | date:'short' }}</span>
              </div>
              <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ notif.message }}</p>
            </div>

            <span *ngIf="!notif.readStatus" class="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 mt-1" title="Non lu"></span>
          </div>
        </div>

        <!-- Aucune notification -->
        <div *ngIf="!loading && notifications.length === 0" 
             class="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md mx-auto space-y-3">
          <div class="text-4xl">🔕</div>
          <h2 class="text-lg font-bold text-gray-900">Aucune notification pour le moment</h2>
          <p class="text-xs text-gray-500">Vous recevrez ici les alertes de nouveaux biens correspondants, les baisses de prix et vos messages de compte.</p>
        </div>

      </div>
    </div>
  `
})
export class NotificationsPageComponent implements OnInit {
  notifications: NotificationItem[] = [];
  loading = true;

  constructor(
    private propertyService: PropertyService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.propertyService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notifications = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  markAsRead(notif: NotificationItem): void {
    if (notif.readStatus) return;
    this.propertyService.markNotificationAsRead(notif.id).subscribe({
      next: () => {
        notif.readStatus = true;
        this.cdr.detectChanges();
      }
    });
  }

  markAllAsRead(): void {
    this.propertyService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.readStatus = true);
        this.toastService.show('Toutes les notifications ont été marquées comme lues.', 'info');
        this.cdr.detectChanges();
      }
    });
  }
}
