import { Component, output, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '@vera/client/shared/ui';

export type MediaType = 'photo' | 'video' | 'audio';

@Component({
  selector: 'app-vera-input',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, IconComponent],
  templateUrl: './vera-input.component.html',
  styleUrl: './vera-input.component.css',
})
export class VeraInputComponent {
  submitQuestion = output<string>();
  submitWithFile = output<{ question: string; file: File | null }>();
  isLoading = input<boolean>(false);

  question = signal<string>('');
  selectedFile = signal<File | null>(null);
  filePreview = signal<string | null>(null);
  showMediaMenu = signal<boolean>(false);

  onSubmit(): void {
    if (this.question().trim() || this.selectedFile()) {
      this.submitWithFile.emit({
        question: this.question().trim(),
        file: this.selectedFile()
      });
      this.question.set('');
      this.clearFile();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      // Preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.filePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.filePreview.set(null);
  }

  onKeyDown(event: KeyboardEvent): void {
    // Submit on Ctrl/Cmd + Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    }
  }

  toggleMediaMenu(): void {
    this.showMediaMenu.update(value => !value);
  }

  closeMediaMenu(): void {
    this.showMediaMenu.set(false);
  }

  closeMediaMenuIfClickedOutside(event: Event, menuElement: HTMLElement): void {
    const target = event.target as HTMLElement;
    if (this.showMediaMenu() && !menuElement.contains(target)) {
      this.closeMediaMenu();
    }
  }
}
