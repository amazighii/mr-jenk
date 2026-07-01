import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductsService } from '../../core/services/products.service';
import type { ProductResponse } from '../../core/models/product.models';
import { SessionStore } from '../../core/state/session.store';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { extractApiErrorMessage } from '../../core/utils/http-error';

@Component({
  standalone: true,
  imports: [
    RouterLink,
    SpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="surface page">
      <div class="top">
        <div>
          <h1>My products</h1>
          <p class="muted">Products are filtered client-side by your seller ID.</p>
        </div>
        <a class="btn" routerLink="/seller/products/new">New product</a>
      </div>

      @if (loading()) {
        <div class="center"><app-spinner /></div>
      } @else if (error()) {
        <app-error-state title="Could not load products" [message]="error()" />
      } @else if (myProducts().length === 0) {
        <app-empty-state
          title="No products yet"
          message="Create your first product to start selling."
          ctaLabel="Create product"
          ctaLink="/seller/products/new"
        />
      } @else {
        <div class="list">
          @for (p of myProducts(); track p.id) {
            <div class="item">
              <div class="left">
                <div class="name">{{ p.name }}</div>
                <div class="muted small">Qty {{ p.quantity }} • {{ p.imageUrls.length }} images</div>
              </div>
              <div class="actions">
                <a class="btn btn--ghost" [routerLink]="['/products', p.id]" [queryParams]="{ from: 'seller' }">View</a>
                <a class="btn btn--ghost" [routerLink]="['/seller/products', p.id, 'edit']">Edit</a>
                <button class="btn btn--danger" type="button" (click)="askDelete(p)">Delete</button>
              </div>
            </div>
          }
        </div>
      }

      <app-confirm-dialog
        [open]="confirmOpen()"
        title="Delete product?"
        message="This will permanently remove the product. Media cleanup is handled by the backend."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        (cancel)="confirmOpen.set(false)"
        (confirm)="confirmDelete()"
      />
    </div>
  `,
  styles: [
    `
      .page {
        padding: 18px;
      }
      .top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }
      h1 {
        margin: 0;
        letter-spacing: -0.03em;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid rgba(15, 118, 110, 0.25);
        background: var(--primary);
        color: white;
        font-weight: 650;
        cursor: pointer;
      }
      .btn:hover {
        background: var(--primary-2);
      }
      .btn--ghost {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .btn--ghost:hover {
        background: rgba(17, 24, 39, 0.04);
      }
      .btn--danger {
        background: var(--danger);
        border-color: rgba(180, 35, 24, 0.25);
      }
      .center {
        padding: 26px 0;
        display: grid;
        place-items: center;
      }
      .list {
        margin-top: 14px;
        display: grid;
        gap: 10px;
      }
      .item {
        padding: 14px;
        border: 1px solid var(--border);
        border-radius: 14px;
        background: var(--surface);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
      }
      .left {
        min-width: 240px;
        flex: 1 1 240px;
        min-width: 0;
      }
      .name {
        font-weight: 700;
        letter-spacing: -0.02em;
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .small {
        font-size: 12px;
        margin-top: 4px;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        flex: 0 0 auto;
      }
      @media (max-width: 620px) {
        .top {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class SellerProductsPage {
  private readonly productsService = inject(ProductsService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);

  readonly products = signal<ProductResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly confirmOpen = signal(false);
  readonly pendingDeleteId = signal<string | null>(null);

  readonly myProducts = computed(() => this.products().filter((p) => p.sellerId === this.session.userId()));

  constructor() {
    void this.load();
  }

  askDelete(p: ProductResponse) {
    this.pendingDeleteId.set(p.id);
    this.confirmOpen.set(true);
  }

  async confirmDelete() {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.confirmOpen.set(false);
    try {
      await this.productsService.delete(id);
      this.toast.show('success', 'Product deleted');
      await this.load();
    } catch (e: any) {
      const msg = extractApiErrorMessage(e, 'Could not delete product.');
      this.toast.show('error', 'Delete failed', msg);
    } finally {
      this.pendingDeleteId.set(null);
    }
  }

  async load() {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.products.set(await this.productsService.list());
    } catch (e) {
      this.error.set(extractApiErrorMessage(e, 'Could not fetch products from the gateway.'));
    } finally {
      this.loading.set(false);
    }
  }
}
