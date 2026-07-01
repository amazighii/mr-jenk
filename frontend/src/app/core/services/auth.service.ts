import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  login(body: LoginRequest): Promise<AuthResponse> {
    return firstValueFrom(this.http.post<AuthResponse>(this.api.url('/api/auth/login'), body));
  }

  register(body: RegisterRequest): Promise<AuthResponse> {
    return firstValueFrom(this.http.post<AuthResponse>(this.api.url('/api/auth/register'), body));
  }
}

