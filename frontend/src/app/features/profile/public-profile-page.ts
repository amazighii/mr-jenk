import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UserService } from '../../core/services/user.service';
import type { PublicUserProfileResponse } from '../../core/models/user.models';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { extractApiErrorMessage } from '../../core/utils/http-error';

@Component({
  standalone: true,
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent],
  template: `
    <div class="container">
      <a class="back muted" routerLink="/products">← Back</a>

      <div class="surface card">
        @if (loading()) {
          <div class="center"><app-spinner /></div>
        } @else if (error()) {
          <app-error-state title="Could not load profile" [message]="error()" />
        } @else if (profile()) {
          <div class="profile">
            <div class="avatar">
              @if (profile()!.avatarUrl) {
                <img [src]="profile()!.avatarUrl!" alt="" />
              } @else {
                <div class="avatar__ph">{{ initials() }}</div>
              }
            </div>
            <div>
              <h1>{{ fullName() }}</h1>
              <p class="muted">{{ profile()!.role }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .back {
        display: inline-flex;
        margin-bottom: 14px;
      }
      .card {
        padding: 20px;
      }
      .center {
        padding: 34px 0;
        display: grid;
        place-items: center;
      }
      .profile {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .avatar {
        width: 86px;
        height: 86px;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid var(--border);
        background: var(--surface-2);
        display: grid;
        place-items: center;
        flex: 0 0 auto;
      }
      .avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar__ph {
        font-weight: 750;
        color: var(--muted);
      }
      h1 {
        margin: 0;
        letter-spacing: -0.03em;
      }
    `,
  ],
})
export class PublicProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly users = inject(UserService);

  readonly profile = signal<PublicUserProfileResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
  readonly fullName = computed(() => {
    const profile = this.profile();
    if (!profile) return '';
    return `${profile.firstName} ${profile.lastName}`.trim();
  });
  readonly initials = computed(() => this.fullName().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U');

  constructor() {
    void this.load();
  }

  async load() {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.profile.set(await this.users.getPublicProfile(this.id()));
    } catch (e) {
      this.error.set(extractApiErrorMessage(e, 'This profile could not be loaded.'));
    } finally {
      this.loading.set(false);
    }
  }
}
