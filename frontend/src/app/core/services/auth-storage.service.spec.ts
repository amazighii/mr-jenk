import { TestBed } from '@angular/core/testing';

import { STORAGE_KEYS } from '../constants/storage';
import { AuthStorageService } from './auth-storage.service';

describe('AuthStorageService', () => {
  let service: AuthStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthStorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('reads and writes the auth token using the shared storage key', () => {
    service.setToken('jwt-token');

    expect(localStorage.getItem(STORAGE_KEYS.token)).toBe('jwt-token');
    expect(service.getToken()).toBe('jwt-token');
  });

  it('clears the stored auth token', () => {
    localStorage.setItem(STORAGE_KEYS.token, 'jwt-token');

    service.clearToken();

    expect(service.getToken()).toBeNull();
  });
});
