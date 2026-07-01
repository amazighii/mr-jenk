import { Injectable, computed, inject, signal } from '@angular/core';

import type { AuthResponse } from '../models/auth.models';
import type { Role } from '../models/role';
import type { UserProfileResponse } from '../models/user.models';
import { getJwtRole, getJwtUserId } from '../utils/jwt';
import { UserService } from '../services/user.service';
import { AuthStorageService } from '../services/auth-storage.service';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly userService = inject(UserService);
  private readonly authStorage = inject(AuthStorageService);

  private readonly _token = signal<string | null>(this.authStorage.getToken());
  private readonly _role = signal<Role | null>(this._token() ? getJwtRole(this._token()!) : null);
  private readonly _userId = signal<string | null>(this._token() ? getJwtUserId(this._token()!) : null);

  readonly me = signal<UserProfileResponse | null>(null);
  readonly loadingMe = signal(false);

  readonly token = this._token.asReadonly();
  readonly role = this._role.asReadonly();
  readonly userId = this._userId.asReadonly();

  readonly isAuthed = computed(() => Boolean(this._token()));
  readonly isSeller = computed(() => this._role() === 'SELLER');
  readonly displayName = computed(() => {
    const me = this.me();
    if (!me) return null;
    return `${me.firstName} ${me.lastName}`.trim();
  });

  constructor() {
    if (this._token()) void this.refreshMe();
  }

  async setAuth(auth: AuthResponse) {
    this.authStorage.setToken(auth.token);
    this._token.set(auth.token);
    this._role.set((auth.role === 'SELLER' || auth.role === 'CLIENT' ? auth.role : getJwtRole(auth.token)) ?? null);
    this._userId.set(getJwtUserId(auth.token) ?? auth.userId ?? null);
    await this.refreshMe();
  }

  logout() {
    this.authStorage.clearToken();
    this._token.set(null);
    this._role.set(null);
    this._userId.set(null);
    this.me.set(null);
  }

  async refreshMe() {
    if (!this._token()) return;
    try {
      this.loadingMe.set(true);
      const profile = await this.userService.getMe();
      this.me.set(profile);
      if (profile.role === 'SELLER' || profile.role === 'CLIENT') this._role.set(profile.role);
      if (profile.id) this._userId.set(profile.id);
    } finally {
      this.loadingMe.set(false);
    }
  }
}
