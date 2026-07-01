import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { SessionStore } from '../../core/state/session.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly session = inject(SessionStore);

  readonly showSeller = computed(() => this.session.isSeller());

  async logout() {
    this.session.logout();
    await this.router.navigateByUrl('/products');
  }
}
