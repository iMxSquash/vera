import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);
  private readonly LANG_STORAGE_KEY = 'vera_language';
  
  currentLanguage = signal<'fr' | 'en'>('fr');

  constructor() {
    this.initializeTranslations();
  }

  private initializeTranslations() {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');
    
    // Récupérer la langue du localStorage ou utiliser le défaut
    const savedLanguage = this.getSavedLanguage();
    this.currentLanguage.set(savedLanguage);
    this.translate.use(savedLanguage);
  }

  private getSavedLanguage(): 'fr' | 'en' {
    const saved = localStorage.getItem(this.LANG_STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') {
      return saved;
    }
    return 'fr';
  }

  switchLanguage(lang: 'fr' | 'en') {
    this.currentLanguage.set(lang);
    this.translate.use(lang);
    localStorage.setItem(this.LANG_STORAGE_KEY, lang);
  }

  get(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  getAsync(key: string, params?: Record<string, unknown>) {
    return this.translate.get(key, params);
  }
}
