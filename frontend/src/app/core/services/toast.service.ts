import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(kind: ToastKind, title: string, message?: string, ttlMs = 3200) {
    const id = crypto.randomUUID();
    this.toasts.update((t) => [...t, { id, kind, title, message }]);
    window.setTimeout(() => this.dismiss(id), ttlMs);
  }

  dismiss(id: string) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

