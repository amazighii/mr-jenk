import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="surface empty">
      <h3 class="empty__title">{{ title }}</h3>
      @if (message) {
        <p class="muted empty__message">{{ message }}</p>
      }
      @if (ctaLabel && ctaLink) {
        <a class="btn" [routerLink]="ctaLink">{{ ctaLabel }}</a>
      }
    </div>
  `,
  styles: [
    `
      .empty {
        padding: 20px;
      }
      .empty__title {
        margin: 0;
      }
      .empty__message {
        margin: 8px 0 0;
      }
      .btn {
        margin-top: 14px;
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
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input() message?: string;
  @Input() ctaLabel?: string;
  @Input() ctaLink?: string;
}

