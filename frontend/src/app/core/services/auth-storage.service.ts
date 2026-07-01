import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage';

@Injectable({ providedIn: 'root' })
export class AuthStorageService {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.token);
  }

  setToken(token: string) {
    localStorage.setItem(STORAGE_KEYS.token, token);
  }

  clearToken() {
    localStorage.removeItem(STORAGE_KEYS.token);
  }
}
