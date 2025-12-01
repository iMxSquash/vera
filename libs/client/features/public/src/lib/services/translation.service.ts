import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);
  
  currentLanguage = signal<'fr' | 'en'>('fr');

  constructor() {
    this.initializeTranslations();
  }

  private initializeTranslations() {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');
    this.translate.use('fr');
  }

  switchLanguage(lang: 'fr' | 'en') {
    this.currentLanguage.set(lang);
    this.translate.use(lang);
  }

  get(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  getAsync(key: string, params?: Record<string, unknown>) {
    return this.translate.get(key, params);
  }
}
