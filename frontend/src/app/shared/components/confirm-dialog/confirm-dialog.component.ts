import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open) {
      <div class="backdrop" (click)="cancel.emit()"></div>
      <div class="dialog" role="dialog" aria-modal="true">
        <h3 class="title">{{ title }}</h3>
        @if (message) {
          <p class="muted msg">{{ message }}</p>
        }
        <div class="actions">
          <button type="button" class="btn btn--ghost" (click)="cancel.emit()">{{ cancelLabel }}</button>
          <button type="button" class="btn" [attr.data-variant]="variant" (click)="confirm.emit()">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(17, 24, 39, 0.45);
        z-index: 60;
      }
      .dialog {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(420px, calc(100% - 32px));
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 16px;
        z-index: 70;
        box-shadow: var(--shadow);
      }
      .title {
        margin: 0;
        letter-spacing: -0.02em;
      }
      .msg {
        margin: 10px 0 0;
        font-size: 13px;
      }
      .actions {
        margin-top: 14px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
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
      .btn--ghost {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .btn--ghost:hover {
        background: rgba(17, 24, 39, 0.04);
      }
      .btn[data-variant='danger'] {
        background: var(--danger);
        border-color: rgba(180, 35, 24, 0.25);
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  @Input({ required: true }) open = false;
  @Input({ required: true }) title = 'Confirm';
  @Input() message?: string;
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() variant: 'primary' | 'danger' = 'primary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}

