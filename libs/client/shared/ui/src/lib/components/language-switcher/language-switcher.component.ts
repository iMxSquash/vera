import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex items-center gap-0.5 bg-white rounded-md border border-gray-200 p-0.5">
      <button 
        (click)="switchTo('fr')"
        [class.bg-gray-100]="currentLanguage() === 'fr'"
        [class.text-gray-900]="currentLanguage() === 'fr'"
        [class.text-gray-500]="currentLanguage() !== 'fr'"
        class="px-2.5 py-1 rounded font-semibold text-xs transition-colors hover:bg-gray-50"
      >
        FR
      </button>
      <div class="w-px h-4 bg-gray-200"></div>
      <button 
        (click)="switchTo('en')"
        [class.bg-gray-100]="currentLanguage() === 'en'"
        [class.text-gray-900]="currentLanguage() === 'en'"
        [class.text-gray-500]="currentLanguage() !== 'en'"
        class="px-2.5 py-1 rounded font-semibold text-xs transition-colors hover:bg-gray-50"
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
