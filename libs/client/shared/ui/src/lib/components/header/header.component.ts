import { Component } from '@angular/core';
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
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <a routerLink="/" class="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            <vera-icon name="logo" [size]="108" [height]="34" [viewBox]="'0 0 108 34'"></vera-icon>
          </a>
        </div>

        <!-- Desktop Navigation -->
        <app-header-nav></app-header-nav>

        <!-- Actions -->
        <app-header-actions></app-header-actions>

        <!-- Mobile Menu -->
        <app-header-mobile></app-header-mobile>
      </div>
    </header>
  `,
})
export class HeaderComponent {}
