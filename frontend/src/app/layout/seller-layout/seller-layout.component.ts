import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SessionStore } from '../../core/state/session.store';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="container">
      <div class="layout">
        <aside class="surface side">
          <div class="side__title">Seller</div>
          <div class="side__meta muted">{{ session.displayName() ?? session.userId() }}</div>
          <nav class="side__nav">
            <a routerLink="/seller/overview" routerLinkActive="is-active">Overview</a>
            <a routerLink="/seller/products" routerLinkActive="is-active">My products</a>
            <a routerLink="/seller/products/new" routerLinkActive="is-active">New product</a>
          </nav>
          <div class="side__hint muted">
            Product images are uploaded via Media Service (max 2 MB, image/*).
          </div>
        </aside>

        <section class="content">
          <router-outlet />
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 16px;
        align-items: start;
      }
      .side {
        padding: 16px;
        position: sticky;
        top: 84px;
      }
      .side__title {
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .side__meta {
        margin-top: 4px;
        font-size: 13px;
      }
      .side__nav {
        margin-top: 14px;
        display: grid;
        gap: 6px;
      }
      .side__nav a {
        padding: 10px 10px;
        border-radius: 12px;
        border: 1px solid transparent;
        color: var(--muted);
      }
      .side__nav a:hover {
        background: rgba(17, 24, 39, 0.04);
        color: var(--text);
      }
      .side__nav a.is-active {
        color: var(--text);
        border-color: rgba(17, 24, 39, 0.10);
        background: rgba(17, 24, 39, 0.03);
      }
      .side__hint {
        margin-top: 14px;
        font-size: 12px;
      }
      @media (max-width: 960px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .side {
          position: static;
        }
      }
    `,
  ],
})
export class SellerLayoutComponent {
  readonly session = inject(SessionStore);
}
