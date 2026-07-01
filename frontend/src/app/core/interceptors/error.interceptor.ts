import { Injectable, Injector, inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { ToastService } from '../services/toast.service';
import { SessionStore } from '../state/session.store';
import { extractApiErrorMessage } from '../utils/http-error';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            const isAuthCall = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
            if (!isAuthCall) {
              this.injector.get(SessionStore).logout();
              this.toast.show('error', 'Session expired', extractApiErrorMessage(err, 'Please log in again.'));
              void this.router.navigateByUrl('/login');
            }
          } else if (err.status === 403) {
            this.toast.show('error', 'Forbidden', extractApiErrorMessage(err));
          } else if (err.status >= 500) {
            this.toast.show('error', 'Server error', extractApiErrorMessage(err));
          }
        }
        return throwError(() => err);
      }),
    );
  }
}
