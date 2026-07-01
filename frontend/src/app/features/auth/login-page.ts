import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../../core/services/auth.service';
import { SessionStore } from '../../core/state/session.store';
import { ToastService } from '../../core/services/toast.service';
import { extractApiErrorMessage } from '../../core/utils/http-error';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="container auth">
      <div class="surface card">
        <h1>Welcome back</h1>
        <p class="muted subtitle">Log in with your email and password.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="row">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <div class="error">Enter a valid email.</div>
            }
          </div>

          <div class="row">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <div class="error">Password is required.</div>
            }
          </div>

          @if (error()) {
            <div class="error">{{ error() }}</div>
          }

          <div class="actions">
            <button class="btn" type="submit" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <app-spinner />
              } @else {
                Log in
              }
            </button>

            <a class="btn btn--ghost" routerLink="/register">Create account</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrl: './auth.styles.css',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      const auth = await this.auth.login(this.form.getRawValue());
      try {
        await this.session.setAuth(auth);
      } catch {
        this.toast.show('error', 'Profile not loaded', 'Open profile and retry.');
      }
      this.toast.show('success', 'Logged in');
      await this.router.navigateByUrl(this.session.isSeller() ? '/seller' : '/products');
    } catch (e) {
      const msg = e instanceof HttpErrorResponse && e.status === 401 ? 'Invalid email or password.' : extractApiErrorMessage(e, 'Could not log in.');
      this.error.set(msg);
      this.toast.show('error', 'Login failed', msg);
    } finally {
      this.loading.set(false);
    }
  }
}
