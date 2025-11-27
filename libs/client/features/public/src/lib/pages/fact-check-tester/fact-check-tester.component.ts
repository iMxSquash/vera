import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';

@Component({
  selector: 'app-fact-check-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fact-check-tester.component.html',
  styleUrl: './fact-check-tester.component.css',
})
export class FactCheckTesterComponent {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  query = signal<string>('');
  userId = signal<string>('test-user-' + Math.random().toString(36).substr(2, 9));
  isLoading = signal<boolean>(false);
  response = signal<string>('');
  error = signal<string | null>(null);

  canSubmit = computed(() => this.query().trim().length > 0 && !this.isLoading());

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

      try {
        const json = JSON.parse(response || '{}');
        this.response.set(json.result || response);
      } catch (e) {
        this.response.set(e instanceof Error ? e.message : 'Erreur lors de la conversion de la réponse');
      }
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
}
