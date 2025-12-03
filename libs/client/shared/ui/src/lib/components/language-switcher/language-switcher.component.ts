import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HyperlinkComponent } from '../hyperlink/hyperlink.component';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule, HyperlinkComponent],
  template: `
    <div class="flex items-center gap-1">
      <app-hyperlink
        [variant]="currentLanguage() === 'fr' ? 'primary' : 'muted'"
        [isAction]="true"
        (action)="switchTo('fr')"
      >
        FR
      </app-hyperlink>
      <div class="">/</div>
      <app-hyperlink
        [variant]="currentLanguage() === 'en' ? 'primary' : 'muted'"
        [isAction]="true"
        (action)="switchTo('en')"
      >
        EN
      </app-hyperlink>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);

  currentLanguage() {
    return this.translate.currentLang as 'fr' | 'en' || localStorage.getItem('vera_language') as 'fr' | 'en' || 'fr';
  }

  switchTo(lang: 'fr' | 'en') {
    this.translate.use(lang);
    localStorage.setItem('vera_language', lang);
  }
}
