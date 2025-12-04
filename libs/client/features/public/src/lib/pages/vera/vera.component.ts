import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
import { VeraSidebarComponent } from './components/vera-sidebar/vera-sidebar.component';
import { VeraChatWindowComponent } from './components/vera-chat-window/vera-chat-window.component';
import { IconComponent } from '@vera/client/shared/ui';

export interface ChatMessage {
  id: string;
  question: string;
  date: Date;
  media?: {
    name: string;
    type: 'image' | 'video' | 'audio';
    preview: string; // Data URL
  };
}

export interface VeraResponse {
  id: string;
  answer: string;
  sources: Source[];
  extractedLinks?: string[];
  timestamp: Date;
}

export interface Source {
  title: string;
  description: string;
  url: string;
}

@Component({
  selector: 'app-vera',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    VeraSidebarComponent,
    VeraChatWindowComponent,
    IconComponent,
  ],
  templateUrl: './vera.component.html',
  styleUrl: './vera.component.css',
})
export class VeraComponent {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly apiUrl = environment.apiUrl;

  chatHistory = signal<ChatMessage[]>([]);
  selectedChat = signal<ChatMessage | null>(null);
  currentResponse = signal<VeraResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  showSidebar = signal<boolean>(false);
  initialQuestion = signal<string>('');

  // Response cache: chatId -> response
  private responseCache = new Map<string, VeraResponse>();

  constructor() {
    this.loadChatHistory();
    
    // Check for query parameter 'text' and populate input field
    this.route.queryParams.subscribe(params => {
      const textQuery = params['text'];
      if (textQuery) {
        const decodedText = decodeURIComponent(textQuery);
        // Set initial question in input field
        this.initialQuestion.set(decodedText);
      }
    });
  }

  toggleSidebar(): void {
    this.showSidebar.update(val => !val);
  }

  showChatOnly(): void {
    this.showSidebar.set(false);
  } 

  showNewChat(): void {
    this.showSidebar.set(false);
    this.selectedChat.set(null);
    this.currentResponse.set(null);
  }

  private loadChatHistory(): void {
    try {
      let allChats: ChatMessage[] = [];

      // Load new format (vera_chat_history)
      const saved = localStorage.getItem('vera_chat_history');
      if (saved) {
        try {
          const chats: ChatMessage[] = JSON.parse(saved);
          // Convert date strings back to Date objects
          const chatsWithDates = chats.map(c => ({
            ...c,
            date: typeof c.date === 'string' ? new Date(c.date) : c.date
          }));
          allChats = chatsWithDates;
        } catch {
          allChats = [];
        }
      }

      // Load legacy format (vera_fact_checks from test page)
      const legacyData = localStorage.getItem('vera_fact_checks');
      if (legacyData) {
        try {
          const legacyChats: Array<{ id: string; query: string; response: string; timestamp: number }> = JSON.parse(legacyData);
          // Convert to ChatMessage format and cache responses
          legacyChats.forEach(legacy => {
            const chatMsg: ChatMessage = {
              id: legacy.id,
              question: legacy.query,
              date: new Date(legacy.timestamp)
            };
            allChats.push(chatMsg);
            // Cache the response with extracted links
            this.responseCache.set(legacy.id, {
              id: legacy.id,
              answer: legacy.response,
              sources: [],
              extractedLinks: this.extractLinks(legacy.response),
              timestamp: new Date(legacy.timestamp)
            });
          });
        } catch {
          // ignore legacy data if parsing fails
        }
      }

      // Déduplicater par ID (garder le plus récent)
      const chatMap = new Map<string, ChatMessage>();
      allChats.forEach(chat => {
        const existing = chatMap.get(chat.id);
        if (!existing || chat.date > existing.date) {
          chatMap.set(chat.id, chat);
        }
      });
      const uniqueChats = Array.from(chatMap.values());

      // Sort by date descending (most recent first)
      uniqueChats.sort((a, b) => b.date.getTime() - a.date.getTime());
      this.chatHistory.set(uniqueChats);

      // Load cached responses from vera_response_cache (only if vera_chat_history exists)
      if (saved) {
        localStorage.getItem('vera_response_cache')?.split('|').forEach((entry) => {
          try {
            const parsed = JSON.parse(entry);
            // Ensure extractedLinks is populated
            if (!parsed.extractedLinks) {
              parsed.extractedLinks = this.extractLinks(parsed.answer);
            }
            this.responseCache.set(parsed.id, parsed);
          } catch {
            // ignore
          }
        });
      }
    } catch {
      this.chatHistory.set([]);
    }
  }

  private saveChatHistory(): void {
    try {
      localStorage.setItem('vera_chat_history', JSON.stringify(this.chatHistory()));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
      // Clear old cache if quota exceeded
      try {
        localStorage.removeItem('vera_response_cache');
        localStorage.setItem('vera_chat_history', JSON.stringify(this.chatHistory()));
      } catch {
        console.error('Unable to save chat history even after clearing cache');
      }
    }

    // Save response cache (only store last 30 responses to save space)
    try {
      const lastResponses = Array.from(this.responseCache.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 30)
        .map((r) => ({
          id: r.id,
          answer: r.answer,
          extractedLinks: r.extractedLinks,
          timestamp: r.timestamp
        }))
        .map((r) => JSON.stringify(r))
        .join('|');
      
      localStorage.setItem('vera_response_cache', lastResponses);
    } catch (e) {
      console.warn('Failed to save response cache:', e);
      // Silently fail - responses will be re-fetched if needed
    }
  }

  async submitQuestion(question: string, media?: File): Promise<void> {
    if ((!question.trim() && !media) || this.isLoading()) return;

    this.error.set(null);

    try {
      // Create media preview if file exists
      let mediaData: ChatMessage['media'] | undefined = undefined;
      if (media) {
        const preview = await this.createMediaPreview(media);
        mediaData = {
          name: media.name,
          type: this.getMediaType(media),
          preview
        };
      }

      const newChat: ChatMessage = {
        id: Date.now().toString(),
        question: question.trim(),
        date: new Date(),
        media: mediaData
      };

      // Add to history and select immediately (BEFORE API call)
      this.chatHistory.update((chats) => [newChat, ...chats]);
      this.selectedChat.set(newChat);
      this.isLoading.set(true);

      // Préparer les données avec FormData comme dans le test
      const formData = new FormData();
      formData.append('userId', 'vera-user-' + Math.random().toString(36).substr(2, 9));
      formData.append('query', newChat.question);
      formData.append('lang', localStorage.getItem('vera_language') || 'fr');
      
      if (media) {
        formData.append('media', media);
      }

      // Appeler l'endpoint /fact-check/verify comme dans le test
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

      // Nettoyer la réponse comme dans le test
      resultText = this.cleanResponse(resultText);

      // Extraire les liens de la réponse
      const extractedLinks = this.extractLinks(resultText);

      const veraResponse: VeraResponse = {
        id: newChat.id,
        answer: resultText,
        sources: [],
        extractedLinks: extractedLinks,
        timestamp: new Date(),
      };

      // Cache the response
      this.responseCache.set(newChat.id, veraResponse);
      this.currentResponse.set(veraResponse);

      this.saveChatHistory();
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

  selectChat(chat: ChatMessage): void {
    this.selectedChat.set(chat);
    const cached = this.responseCache.get(chat.id);
    if (cached) {
      this.currentResponse.set(cached);
    } else {
      this.currentResponse.set(null);
    }
  }

  createNewChat(): void {
    this.selectedChat.set(null);
    this.currentResponse.set(null);
  }

  deleteChat(chat: ChatMessage): void {
    this.chatHistory.update((chats) => chats.filter(c => c.id !== chat.id));
    this.responseCache.delete(chat.id);
    this.saveChatHistory();
    // If the deleted chat was selected, clear selection
    if (this.selectedChat()?.id === chat.id) {
      this.createNewChat();
    }
  }

  onSubmitQuestion(question: string): void {
    this.submitQuestion(question);
  }

  onSubmitWithFile(data: { question: string; file: File | null }): void {
    this.submitQuestion(data.question, data.file || undefined);
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

  // Méthode pour déterminer le type de média
  private getMediaType(file: File): 'image' | 'video' | 'audio' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'image'; // Default
  }

  // Méthode pour créer une preview du média
  private createMediaPreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}
