import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="hidden md:flex items-center gap-8">
      <a 
        routerLink="/" 
        class="text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
      >
        Accueil
      </a>
      <a 
        routerLink="/vera" 
        class="text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
      >
        Vera Web
      </a>
      <a 
        routerLink="/fact-check-test" 
        class="text-gray-700 text-sm font-medium hover:text-gray-900 transition-colors"
      >
        Test Fact-Check
      </a>
    </nav>
  `,
})
export class HeaderNavComponent {}
