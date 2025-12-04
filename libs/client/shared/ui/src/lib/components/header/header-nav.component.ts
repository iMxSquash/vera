import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';

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
        [class]="isVeraRoute() ? 'inline-block text-neutrals-900 bg-neutrals-50 text-[14px] rounded-full px-[24px] py-[8px] border border-neutrals-50 hover:opacity-90 transition-opacity' : 'inline-block text-neutrals-50 bg-neutrals-900 text-[14px] border border-neutrals-900 rounded-full px-[24px] py-[8px] hover:opacity-90 transition-opacity'"
      >
        Parler à Vera
      </a>
    </nav>
  `,
})
export class HeaderNavComponent {
  private readonly router = inject(Router);
  
  isVeraRoute = toSignal(
    this.router.events.pipe(
      startWith(null),
      map(() => this.router.url === '/vera')
    ),
    { initialValue: false }
  );
}
