import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;
  private readonly defaultDuration = 4000;

  show(message: string, type: ToastType = 'info', duration: number = this.defaultDuration): void {
    const id = ++this.nextId;
    const toast: ToastMessage = { id, message, type };

    this._toasts.update(toasts => [...toasts, toast]);

    // Auto-suppression après duration ms
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}