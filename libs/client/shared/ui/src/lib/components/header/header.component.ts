import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderNavComponent } from './header-nav.component';
import { HeaderActionsComponent } from './header-actions.component';
import { HeaderMobileComponent } from './header-mobile.component';
import { IconComponent } from "../../icons";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderNavComponent, HeaderActionsComponent, HeaderMobileComponent, IconComponent],
  template: `
    <header class="sticky top-0 z-50 bg-vera-cream flex items-center justify-between h-[57px] lg:h-[80px] px-[20px] shadow-sm">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <a routerLink="/" class="hover:opacity-80 transition-opacity">
          <vera-icon name="logo" [size]="56" [height]="18" [viewBox]="'0 0 56 18'"></vera-icon>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <app-header-nav></app-header-nav>

      <!-- Actions -->
      <app-header-actions></app-header-actions>

      <!-- Mobile Menu -->
      @if (isMobile()) {
        <app-header-mobile></app-header-mobile>
      }
    </header>
  `,
})
export class HeaderComponent {
  isMobile = signal(false);

  constructor() {
    // Check initial screen size
    this.checkMobileSize();
    // Listen to window resize
    window.addEventListener('resize', () => this.checkMobileSize());
  }

  private checkMobileSize() {
    this.isMobile.set(window.innerWidth < 768);
  }
}
