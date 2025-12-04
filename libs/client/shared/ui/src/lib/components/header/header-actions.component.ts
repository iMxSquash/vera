import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header-actions',
  standalone: true,
  imports: [CommonModule, LanguageSwitcherComponent],
  template: `
    <div class="hidden md:flex items-center gap-4">
      <app-language-switcher></app-language-switcher>
    </div>
  `,
})
export class HeaderActionsComponent {}
