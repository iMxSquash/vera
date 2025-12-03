import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-header-mobile',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  template: `
    <div class="md:hidden flex items-center gap-3">
      <button 
        (click)="toggleMenu()"
        class="p-2 hover:bg-gray-100 rounded-md transition-colors"
        [attr.aria-label]="isOpen() ? 'Fermer le menu' : 'Ouvrir le menu'"
        [attr.aria-expanded]="isOpen()"
      >
        <vera-icon 
          *ngIf="!isOpen()" 
          name="burger-menu" 
          [size]="24"
          class="text-gray-900"
        ></vera-icon>
        <vera-icon 
          *ngIf="isOpen()" 
          name="cross" 
          [size]="24"
          class="text-gray-900"
        ></vera-icon>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <div 
      *ngIf="isOpen()"
      class="fixed inset-0 top-16 md:hidden z-40 bg-white border-t border-gray-200 animate-in fade-in"
    >
      <nav class="flex flex-col p-4 gap-3">
        <a 
          routerLink="/" 
          (click)="isOpen.set(false)"
          class="px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 rounded-md transition-colors"
        >
          Accueil
        </a>
        <a 
          routerLink="/vera" 
          (click)="isOpen.set(false)"
          class="px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 rounded-md transition-colors"
        >
          Vera Web
        </a>
        <a 
          routerLink="/fact-check-test" 
          (click)="isOpen.set(false)"
          class="px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 rounded-md transition-colors"
        >
          Test Fact-Check
        </a>
        <div class="border-t border-gray-200 my-2"></div>
        <a 
          routerLink="/auth/login"
          (click)="isOpen.set(false)"
          class="px-4 py-3 bg-gray-900 text-white text-base font-medium rounded-md hover:bg-gray-800 transition-colors text-center sm:hidden"
        >
          Se connecter
        </a>
      </nav>
    </div>
  `,
})
export class HeaderMobileComponent {
  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update((val) => !val);
  }
}
