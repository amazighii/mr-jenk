import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { SessionStore } from '../state/session.store';

export const guestGuard: CanMatchFn = () => {
  const session = inject(SessionStore);
  if (!session.isAuthed()) return true;
  const router = inject(Router);
  return router.parseUrl('/products');
};

