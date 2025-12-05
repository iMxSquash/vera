import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <nav class="hidden md:flex items-center gap-8">
      <a 
        routerLink="/" 
        class="text-neutrals-900 text-[14px] hover:text-brand-2 transition-colors"
      >
        {{ 'landing.footer.home' | translate }}
      </a>
      <a 
        href="https://github.com/iMxSquash/vera-extension"
        target="_blank" rel="noopener noreferrer"
        class="text-neutrals-900 text-[14px] hover:text-brand-2 transition-colors"
      >
        {{ 'landing.hero.download_extension' | translate }}
      </a>
      <a 
        routerLink="/vera" 
        [class]="isVeraRoute() ? 'inline-block text-neutrals-900 bg-neutrals-50 text-[14px] rounded-full px-[24px] py-[8px] border border-neutrals-50 hover:opacity-90 transition-opacity' : 'inline-block text-neutrals-50 bg-neutrals-900 text-[14px] border border-neutrals-900 rounded-full px-[24px] py-[8px] hover:opacity-90 transition-opacity'"
      >
        {{ 'landing.footer.talk_vera' | translate }}
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
