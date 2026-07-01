import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type RuntimeConfig = {
  apiBaseUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly runtimeConfig = (globalThis as typeof globalThis & { __BUY01_CONFIG__?: RuntimeConfig })
    .__BUY01_CONFIG__;

  readonly baseUrl = (this.runtimeConfig?.apiBaseUrl || environment.apiBaseUrl).replace(/\/$/, '');

  url(path: string): string {
    if (!path.startsWith('/')) return `${this.baseUrl}/${path}`;
    console.log('Constructing API URL for path', `${this.baseUrl}${path}`);

    return `${this.baseUrl}${path}`;
  }
}
