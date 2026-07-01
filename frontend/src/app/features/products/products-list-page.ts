import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

import { ProductsService } from '../../core/services/products.service';
import type { ProductResponse } from '../../core/models/product.models';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../core/utils/http-error';

@Component({
  standalone: true,
  imports: [RouterLink, CurrencyPipe, SpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <div class="container">
      <div class="hero">
        <h1>Products</h1>
        <p class="muted">Browse all listings. Sellers manage products through the dashboard.</p>
      </div>

      @if (loading()) {
        <div class="center"><app-spinner /></div>
      } @else if (error()) {
        <app-error-state title="Could not load products" [message]="error()" />
      } @else if (products().length === 0) {
        <app-empty-state title="No products yet" message="When sellers add products, they’ll appear here." />
      } @else {
        <div class="grid">
          @for (p of products(); track p.id) {
            <a class="card surface" [routerLink]="['/products', p.id]">
              <div class="card__img">
                @if (p.imageUrls.length) {
                  <img [src]="p.imageUrls[0]" [alt]="p.name" loading="lazy" />
                } @else {
                  <div class="placeholder">No image</div>
                }
              </div>
              <div class="card__body">
                <div class="card__title">{{ p.name }}</div>
                <div class="card__desc muted">{{ p.description }}</div>
                <div class="card__meta">
                  <div class="price">{{ asNumber(p.price) | currency : 'USD' : 'symbol' : '1.2-2' }}</div>
                  <div class="muted">Qty {{ p.quantity }}</div>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .hero {
        padding: 8px 0 18px;
      }
      h1 {
        margin: 0;
        letter-spacing: -0.03em;
      }
      .center {
        display: grid;
        place-items: center;
        padding: 34px 0;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        gap: 14px;
      }
      .card {
        grid-column: span 4;
        overflow: hidden;
        transition: transform 120ms ease, box-shadow 120ms ease;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow);
      }
      .card__img {
        aspect-ratio: 4 / 3;
        background: var(--surface-2);
        border-bottom: 1px solid var(--border);
        display: grid;
        place-items: center;
        overflow: hidden;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .placeholder {
        color: var(--muted);
        font-size: 13px;
      }
      .card__body {
        padding: 14px;
        min-width: 0;
      }
      .card__title {
        font-weight: 650;
        letter-spacing: -0.01em;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .card__desc {
        margin-top: 6px;
        font-size: 13px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .card__meta {
        margin-top: 12px;
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
        flex-wrap: wrap;
      }
      .price {
        font-weight: 650;
        white-space: nowrap;
      }
      @media (max-width: 980px) {
        .card {
          grid-column: span 6;
        }
      }
      @media (max-width: 640px) {
        .card {
          grid-column: span 12;
        }
      }
    `,
  ],
})
export class ProductsListPage {
  private readonly productsService = inject(ProductsService);

  readonly products = signal<ProductResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  asNumber(value: string | number): number {
    return typeof value === 'number' ? value : Number(value);
  }

  async load() {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.products.set(await this.productsService.list());
    } catch (e) {
      this.error.set(extractApiErrorMessage(e, 'Could not load products.'));
    } finally {
      this.loading.set(false);
    }
  }
}
