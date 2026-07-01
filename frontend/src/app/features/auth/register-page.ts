import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { SessionStore } from '../../core/state/session.store';
import { ToastService } from '../../core/services/toast.service';
import type { Role } from '../../core/models/role';
import { extractApiErrorMessage } from '../../core/utils/http-error';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

function passwordsMatch(group: { password: string; confirmPassword: string }) {
  return group.password === group.confirmPassword ? null : { mismatch: true };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent],
  template: `
    <div class="container auth">
      <div class="surface card">
        <h1>Create an account</h1>
        <p class="muted subtitle">Register as a client or a seller.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="row">
            <label for="firstName">First name</label>
            <input id="firstName" type="text" formControlName="firstName" autocomplete="given-name" />
            @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
              <div class="error">First name is required.</div>
            }
          </div>

          <div class="row">
            <label for="lastName">Last name</label>
            <input id="lastName" type="text" formControlName="lastName" autocomplete="family-name" />
            @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
              <div class="error">Last name is required.</div>
            }
          </div>

          <div class="row">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <div class="error">Enter a valid email.</div>
            }
          </div>

          <div class="row">
            <label for="role">Role</label>
            <select id="role" formControlName="role">
              <option value="CLIENT">Client</option>
              <option value="SELLER">Seller</option>
            </select>
          </div>

          <div class="row">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <div class="error">Minimum 8 characters.</div>
            }
          </div>

          <div class="row">
            <label for="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password" />
            @if (form.touched && form.hasError('mismatch')) {
              <div class="error">Passwords do not match.</div>
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
                Create account
              }
            </button>

            <a class="btn btn--ghost" routerLink="/login">I already have an account</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrl: './auth.styles.css',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['CLIENT' as Role, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: [
        (ctrl) => {
          const v = ctrl.value as any;
          return passwordsMatch({ password: v?.password ?? '', confirmPassword: v?.confirmPassword ?? '' });
        },
      ],
    },
  );

  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      const v = this.form.getRawValue();
      const auth = await this.auth.register({
        email: v.email,
        password: v.password,
        firstName: v.firstName,
        lastName: v.lastName,
        role: v.role,
      });
      this.session.setAuth(auth);
      this.toast.show('success', 'Account created');
      await this.router.navigateByUrl(this.session.isSeller() ? '/seller' : '/products');
    } catch (e) {
      const msg = extractApiErrorMessage(e, 'Could not register.');
      this.error.set(msg);
      this.toast.show('error', 'Registration failed', msg);
    } finally {
      this.loading.set(false);
    }
  }
}
