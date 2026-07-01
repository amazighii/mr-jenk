import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `
    <div class="surface error">
      <h3 class="error__title">{{ title }}</h3>
      @if (message) {
        <p class="muted error__message">{{ message }}</p>
      }
    </div>
  `,
  styles: [
    `
      .error {
        padding: 20px;
        border-color: rgba(180, 35, 24, 0.18);
      }
      .error__title {
        margin: 0;
      }
      .error__message {
        margin: 8px 0 0;
      }
    `,
  ],
})
export class ErrorStateComponent {
  @Input({ required: true }) title!: string;
  @Input() message?: string | null;
}
