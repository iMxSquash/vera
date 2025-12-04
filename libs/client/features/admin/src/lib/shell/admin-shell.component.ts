import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@vera/client/features/auth';
import { IconComponent } from '@vera/client/shared/ui';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css',
})
export class AdminShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentAdmin = this.authService.currentAdmin;
  readonly isAuthenticated = this.authService.isAuthenticated;

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    this.authService.logout();
  }
}
