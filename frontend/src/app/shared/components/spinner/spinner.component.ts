import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `<div class="spinner" role="status" aria-label="Loading"></div>`,
  styles: [
    `
      .spinner {
        width: 32px;
        height: 32px;
        border-radius: 999px;
        border: 3px solid rgba(17, 24, 39, 0.12);
        border-top-color: var(--primary);
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class SpinnerComponent {}

