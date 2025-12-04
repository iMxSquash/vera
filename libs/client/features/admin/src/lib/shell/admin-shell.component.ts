import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '@vera/client/shared/ui'; // ton composant icône

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterModule,   // <-- nécessaire pour router-outlet
    IconComponent,  // ton composant icon
  ],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss'],
})
export class AdminShellComponent {
  private router = inject(Router);

  currentAdmin() {
    return { email: 'admin@vera.com' };
  }

  logout() {
    console.log('Logout');
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
