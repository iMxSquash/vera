import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';

interface FactCheckRecord {
  id: string;
  query: string;
  response: string;
  timestamp: number;
}

@Component({
  selector: 'app-fact-check-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fact-check-tester.component.html',
  styleUrl: './fact-check-tester.component.css',
})
export class FactCheckTesterComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'vera_fact_checks';

  query = signal<string>('');
  userId = signal<string>('test-user-' + Math.random().toString(36).substr(2, 9));
  isLoading = signal<boolean>(false);
  response = signal<string>('');
  error = signal<string | null>(null);
  extractedLinks = signal<string[]>([]);
  factChecksHistory = signal<FactCheckRecord[]>([]);

  canSubmit = computed(() => this.query().trim().length > 0 && !this.isLoading());

  ngOnInit(): void {
    this.loadFactChecksFromStorage();
  }

  async submitFactCheck(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isLoading.set(true);
    this.response.set('');
    this.error.set(null);

    try {
      const payload = {
        userId: this.userId(),
        query: this.query(),
      };
      
      // Appel au backend local (qui fera un appel à l'API Vera)
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/fact-check/verify-external`, payload, { responseType: 'text' })
      );

      let resultText: string;
      try {
        const json = JSON.parse(response || '{}');
        resultText = json.result || response;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        resultText = response || 'Réponse reçue';
      }

      this.response.set(resultText);
      this.extractedLinks.set(this.extractLinks(resultText));

      // Sauvegarder en localStorage
      this.saveFactCheckToStorage(resultText);

    } catch (err: unknown) {
      const error = err as { error?: { message?: string }; message?: string };
      this.error.set(
        error?.error?.message || error?.message || 'Une erreur est survenue lors de la vérification'
      );
      console.error('Fact check error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  clearForm(): void {
    this.query.set('');
    this.response.set('');
    this.error.set(null);
    this.extractedLinks.set([]);
  }

  private saveFactCheckToStorage(response: string): void {
    const factCheck: FactCheckRecord = {
      id: Date.now().toString(),
      query: this.query(),
      response,
      timestamp: Date.now(),
    };

    const currentHistory = this.factChecksHistory();
    const updatedHistory = [factCheck, ...currentHistory].slice(0, 50); // Garder seulement les 50 derniers

    this.factChecksHistory.set(updatedHistory);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
  }

  private loadFactChecksFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const history: FactCheckRecord[] = JSON.parse(stored);
        this.factChecksHistory.set(history);
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis localStorage:', error);
      this.factChecksHistory.set([]);
    }
  }

  clearHistory(): void {
    this.factChecksHistory.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('fr-FR');
  }

  reloadFactCheck(factCheck: FactCheckRecord): void {
    this.query.set(factCheck.query);
    this.response.set(factCheck.response);
    this.extractedLinks.set(this.extractLinks(factCheck.response));
  }

  // Méthode pour extraire les liens d'un texte
  private extractLinks(text: string): string[] {
    if (!text) return [];

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links: string[] = [];
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0].replace(/[.,;!?()]+$/, '');
      if (!links.includes(url)) {
        links.push(url);
      }
    }

    return links;
  }

  // Méthode pour convertir les URLs en liens HTML cliquables
  formatResponseWithLinks(text: string): string {
    if (!text) return '';

    // Expression régulière pour détecter les URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Remplacer les URLs par des liens HTML
    return text.replace(urlRegex, (url) => {
      const cleanUrl = url.replace(/[.,;!?()]+$/, '');
      const punctuation = url.slice(cleanUrl.length);

      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${cleanUrl}</a>${punctuation}`;
    });
  }

  // Méthode pour obtenir l'URL du favicon d'un domaine
  getFaviconUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    } catch {
      return '';
    }
  }

  // Méthode pour extraire le domaine d'une URL
  getDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  }

  // Méthode pour gérer l'erreur de chargement d'une image
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}
