import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
      <button 
        (click)="switchTo('fr')"
        [class.bg-blue-100]="currentLanguage() === 'fr'"
        [class.text-blue-700]="currentLanguage() === 'fr'"
        class="px-3 py-1.5 rounded font-medium text-sm transition-colors hover:bg-slate-100"
      >
        FR
      </button>
      <div class="w-px h-5 bg-slate-200"></div>
      <button 
        (click)="switchTo('en')"
        [class.bg-blue-100]="currentLanguage() === 'en'"
        [class.text-blue-700]="currentLanguage() === 'en'"
        class="px-3 py-1.5 rounded font-medium text-sm transition-colors hover:bg-slate-100"
      >
        EN
      </button>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);

  currentLanguage() {
    return this.translate.currentLang as 'fr' | 'en';
  }

  switchTo(lang: 'fr' | 'en') {
    this.translate.use(lang);
    localStorage.setItem('vera_language', lang);
  }
}
