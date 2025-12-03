import { Component, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '@vera/client/shared/ui';
import { VeraWelcomeComponent } from '../vera-welcome/vera-welcome.component';
import { VeraInputComponent } from '../vera-input/vera-input.component';
import { VeraSkeletonComponent } from '../vera-skeleton/vera-skeleton.component';
import { ChatMessage, VeraResponse } from '../../vera.component';

@Component({
  selector: 'app-vera-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IconComponent,
    VeraWelcomeComponent,
    VeraInputComponent,
    VeraSkeletonComponent,
  ],
  templateUrl: './vera-chat-window.component.html',
  styleUrl: './vera-chat-window.component.css',
})
export class VeraChatWindowComponent {
  selectedChat = input<ChatMessage | null>(null);
  response = input<VeraResponse | null>(null);
  isLoading = input<boolean>(false);
  error = input<string | null>(null);
  initialQuestion = input<string>('');

  submitQuestion = output<string>();
  submitWithFile = output<{ question: string; file: File | null }>();

  // Signal pour afficher le toast de copie
  showCopyToast = signal<boolean>(false);

  // Récupère tous les liens extraits (déduplicatés) de la réponse actuelle
  allExtractedLinks = computed(() => {
    const links = this.response()?.extractedLinks ?? [];
    // Dédupliquer les liens
    return Array.from(new Set(links));
  });

  onSubmitQuestion(data: { question: string; file: File | null }): void {
    this.submitWithFile.emit(data);
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

  // Méthode pour convertir les URLs en liens HTML cliquables
  formatResponseWithLinks(text: string): string {
    if (!text) return '';

    // Expression régulière pour détecter les URLs (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Remplacer les URLs par des liens HTML
    return text.replace(urlRegex, (url) => {
      const cleanUrl = url.replace(/[.,;!?()]+$/, '');
      const punctuation = url.slice(cleanUrl.length);

      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-green-600 hover:underline">${cleanUrl}</a>${punctuation}`;
    });
  }

  // Méthode pour copier la réponse
  copyResponse(text: string): void {
    const plainText = text.replace(/<[^>]*>/g, '');
    
    navigator.clipboard.writeText(plainText).then(() => {
      this.showCopyToast.set(true);
      setTimeout(() => {
        this.showCopyToast.set(false);
      }, 2000);
    }).catch(err => {
      console.error('Erreur lors de la copie:', err);
    });
  }
}
