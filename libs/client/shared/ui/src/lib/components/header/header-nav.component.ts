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
        class="text-neutrals-900 text-[14px] hover:text-brand-2 transition-colors"
      >
        Accueil
      </a>
      <a 
        routerLink="/download" 
        class="text-neutrals-900 text-[14px] hover:text-brand-2 transition-colors"
      >
        Télécharger l'extension
      </a>
      <a 
        routerLink="/vera" 
        class="inline-block text-neutrals-50 bg-neutrals-900 text-[14px] border border-black rounded-full px-[24px] py-[8px] hover:opacity-90 transition-opacity"
      >
        Parler à Vera
      </a>
    </nav>
  `,
})
export class HeaderNavComponent {}
