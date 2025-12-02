import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header-actions',
  standalone: true,
  imports: [CommonModule, RouterLink, LanguageSwitcherComponent],
  template: `
    <div class="flex items-center gap-4">
      <app-language-switcher></app-language-switcher>
      <a 
        routerLink="/auth/login"
        class="hidden sm:inline-flex px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
      >
        Se connecter
      </a>
    </div>
  `,
})
export class HeaderActionsComponent {}
