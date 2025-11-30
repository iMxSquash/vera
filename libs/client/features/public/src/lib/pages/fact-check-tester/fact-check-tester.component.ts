import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
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
export class FactCheckTesterComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'vera_fact_checks';

  query = signal<string>('');
  userId = signal<string>('test-user-' + Math.random().toString(36).substr(2, 9));
  isLoading = signal<boolean>(false);
  response = signal<string>('');
  error = signal<string | null>(null);
  extractedLinks = signal<string[]>([]);
  factChecksHistory = signal<FactCheckRecord[]>([]);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string>('');
  isDragOver = signal<boolean>(false);
  selectedMediaType = signal<'image' | 'video' | 'audio' | null>(null);

  canSubmit = computed(() => (this.query().trim().length > 0 || this.selectedImage() !== null) && !this.isLoading());

  constructor() {
    // Charger l'historique depuis le localStorage
    this.loadFactChecksFromStorage();
    
    // Récupérer le texte depuis les query parameters
    this.route.queryParams.subscribe(params => {
      const text = params['text'];
      if (text) {
        this.query.set(decodeURIComponent(text));
      }
    });
  }

  async submitFactCheck(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isLoading.set(true);
    this.response.set('');
    this.error.set(null);

    try {
      const formData = new FormData();
      formData.append('userId', this.userId());
      formData.append('query', this.query());
      
      // Si une image est sélectionnée, l'ajouter aux données
      const selectedImage = this.selectedImage();
      if (selectedImage) {
        formData.append('media', selectedImage);
      }
      
      // Appel au backend qui gère tout (upload image + analyse Gemini + vérification Vera)
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/fact-check/verify`, formData)
      );

      let resultText: string;
      if (typeof response === 'string') {
        resultText = response;
      } else {
        const responseObj = response as { result?: string };
        resultText = responseObj?.result || 'Réponse reçue';
      }

      // Nettoyer la réponse des messages indésirables
      resultText = this.cleanResponse(resultText);

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
    this.removeImage();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedImage.set(file);
      if (file.type.startsWith('image/')) {
        this.selectedMediaType.set('image');
        this.createImagePreview(file);
      } else if (file.type.startsWith('video/')) {
        this.selectedMediaType.set('video');
        this.createVideoPreview(file);
      } else if (file.type.startsWith('audio/')) {
        this.selectedMediaType.set('audio');
        this.createAudioPreview();
      }
    }
  }

  private createImagePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  private createVideoPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  private createAudioPreview(): void {
    // Pour l'audio, on ne peut pas créer un aperçu visuel, mais on peut définir une valeur par défaut
    this.imagePreview.set('audio-placeholder');
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set('');
    this.selectedMediaType.set(null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImage.set(file);
        this.selectedMediaType.set('image');
        this.createImagePreview(file);
      } else if (file.type.startsWith('video/')) {
        this.selectedImage.set(file);
        this.selectedMediaType.set('video');
        this.createVideoPreview(file);
      } else if (file.type.startsWith('audio/')) {
        this.selectedImage.set(file);
        this.selectedMediaType.set('audio');
        this.createAudioPreview();
      } else {
        this.error.set('Veuillez sélectionner un fichier image, vidéo ou audio valide.');
      }
    }
  }

  private saveFactCheckToStorage(response: string): void {
    const mediaType = this.selectedMediaType();
    const mediaInfo = mediaType ? `[${mediaType.toUpperCase()}: ${this.selectedImage()?.name}]` : '';
    const query = this.query() || mediaInfo;

    const factCheck: FactCheckRecord = {
      id: Date.now().toString(),
      query: query,
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

  // Méthode pour nettoyer la réponse (supprimer lignes vides et espaces)
  private cleanResponse(response: string): string {
    if (!response) return response;

    // Supprimer les messages de politesse spécifiques
    const messagesToRemove = [
      "Patientez quelques secondes, je suis en train de vérifier les faits.",
      "Je vais vérifier cette information pour vous. Un instant, s'il vous plaît.",
      "Si vous avez besoin de précisions ou souhaitez explorer un aspect particulier, faites-le moi savoir, et je pourrai vous aider davantage.",
      "Je vais analyser cette information pour vous.",
      "Un instant, s'il vous plaît.",
      "Si vous avez besoin de précisions",
      "faites-le moi savoir",
      "je pourrai vous aider davantage",
      "Merci de poser votre question. Je vais vérifier les informations disponibles à ce sujet. Veuillez patienter un instant.",
      "N'hésitez pas à me dire si vous souhaitez explorer un aspect particulier de cette question.",
      "Je vais vérifier les informations à ce sujet, merci de patienter.",
      "Si vous souhaitez explorer plus en profondeur ce sujet ou avez des questions spécifiques, n'hésitez pas à me le faire savoir.",
      "Je vais vérifier cela pour vous, merci de patienter un instant.",
      "Je suis là si vous souhaitez en discuter davantage ou si vous avez d'autres questions."
    ];

    let cleanedResponse = response;

    // Supprimer chaque message indésirable
    messagesToRemove.forEach(message => {
      const regex = new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      cleanedResponse = cleanedResponse.replace(regex, '');
    });

    // Nettoyer les espaces et sauts de ligne
    return cleanedResponse
      .split('\n') // Diviser en lignes
      .map(line => line.trim()) // Supprimer les espaces de chaque ligne
      .filter(line => line.length > 0) // Supprimer les lignes vides
      .join('\n') // Rejoindre les lignes
      .replace(/\n{3,}/g, '\n\n') // Maximum 2 sauts de ligne consécutifs
      .trim(); // Supprimer les espaces au début et à la fin
  }
}
