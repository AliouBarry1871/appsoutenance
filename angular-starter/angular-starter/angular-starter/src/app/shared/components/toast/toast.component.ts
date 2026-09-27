import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto px-5 py-4 rounded-2xl shadow-xl text-white font-medium text-sm flex items-start justify-between gap-3 transition-all duration-300 animate-fade-in"
          [class]="getToastClass(toast.type)">
          <div class="flex items-start gap-3">
            <span class="text-lg shrink-0">{{ getIcon(toast.type) }}</span>
            <span class="leading-snug">{{ toast.message }}</span>
          </div>
          <button 
            (click)="toastService.remove(toast.id)" 
            class="shrink-0 text-white/80 hover:text-white transition ml-1 cursor-pointer font-bold text-base leading-none mt-0.5">
            ✕
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-emerald-600 border border-emerald-500';
      case 'error':   return 'bg-red-600 border border-red-500';
      case 'warning': return 'bg-amber-500 border border-amber-400';
      default:        return 'bg-blue-600 border border-blue-500';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error':   return '❌';
      case 'warning': return '⚠️';
      default:        return 'ℹ️';
    }
  }
}