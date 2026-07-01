import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <div class="surface page">
        <h1>Page not found</h1>
        <p class="muted">The page you requested does not exist.</p>
        <a class="btn" routerLink="/products">Back to products</a>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        padding: 22px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        height: 40px;
        padding: 0 14px;
        border-radius: 12px;
        background: var(--primary);
        color: white;
      }
      .btn:hover {
        background: var(--primary-2);
      }
    `,
  ],
})
export class NotFoundPage {}

