import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import type { ProductRequest, ProductResponse } from '../models/product.models';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  list(): Promise<ProductResponse[]> {
    return firstValueFrom(this.http.get<ProductResponse[]>(this.api.url('/api/products')));
  }

  get(id: string): Promise<ProductResponse> {
    return firstValueFrom(this.http.get<ProductResponse>(this.api.url(`/api/products/${id}`)));
  }

  create(body: ProductRequest): Promise<ProductResponse> {
    console.log('Creating product with body', body);
    return firstValueFrom(this.http.post<ProductResponse>(this.api.url('/api/products'), body));
  }

  update(id: string, body: ProductRequest): Promise<ProductResponse> {
    return firstValueFrom(this.http.put<ProductResponse>(this.api.url(`/api/products/${id}`), body));
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(this.api.url(`/api/products/${id}`)));
  }
}

