import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthStorageService } from '../services/auth-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authStorage = inject(AuthStorageService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authStorage.getToken();
    if (!token) return next.handle(req);

    return next.handle(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }
}
