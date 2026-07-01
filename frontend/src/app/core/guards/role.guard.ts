import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import type { Role } from '../models/role';
import { SessionStore } from '../state/session.store';
import { ToastService } from '../services/toast.service';

export const roleGuard =
  (allowed: Role[]): CanMatchFn =>
  () => {
    const session = inject(SessionStore);
    const role = session.role();
    if (role && allowed.includes(role)) return true;
    inject(ToastService).show('error', 'Forbidden', 'This area is restricted.');
    const router = inject(Router);
    return router.parseUrl('/products');
  };
