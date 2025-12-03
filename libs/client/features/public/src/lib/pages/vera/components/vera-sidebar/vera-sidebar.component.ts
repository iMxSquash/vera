import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '@vera/client/shared/ui';
import { ChatMessage } from '../../vera.component';

@Component({
  selector: 'app-vera-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  templateUrl: './vera-sidebar.component.html',
  styleUrl: './vera-sidebar.component.css',
})
export class VeraSidebarComponent {
  chats = input<ChatMessage[]>([]);
  selectedChat = input<ChatMessage | null>(null);

  newChat = output<void>();
  selectChat = output<ChatMessage>();
  deleteChat = output<ChatMessage>();

  onNewChat(): void {
    this.newChat.emit();
  }

  onSelectChat(chat: ChatMessage): void {
    this.selectChat.emit(chat);
  }

  onDeleteChat(chat: ChatMessage, event: Event): void {
    event.stopPropagation();
    this.deleteChat.emit(chat);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
