import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceSwapService } from '@vera/data-access';

export interface FaceSwapResponse {
  id: string;
  taskId?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Staged';
  inputImageUrl: string;
  outputImageUrl?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'vera-image-upload-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload-preview.component.html',
})
export class ImageUploadPreviewComponent {
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  result = signal<FaceSwapResponse | null>(null);
  resultImageUrl = signal<string | null>(null);

  constructor(private faceSwapService: FaceSwapService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private handleFile(file: File): void {
    // Validate file
    if (!file.type.startsWith('image/')) {
      this.error.set('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      this.error.set('L\'image ne doit pas dépasser 10MB');
      return;
    }

    this.selectedFile.set(file);
    this.error.set(null);
    this.result.set(null);
    this.resultImageUrl.set(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  submitFaceSwap(): void {
    const file = this.selectedFile();
    if (!file) {
      this.error.set('Veuillez sélectionner une image');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    // Use a dummy user ID for now
    const userId = 'public-user';

    this.faceSwapService.uploadAndSwap(file, userId).subscribe({
      next: (response) => {
        this.result.set(response);
        this.pollTaskStatus(response.id);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(
          err.error?.message || 'Une erreur est survenue lors de l\'envoi'
        );
      },
    });
  }

  private pollTaskStatus(taskId: string): void {
    const pollInterval = setInterval(() => {
      this.faceSwapService.getTaskStatus(taskId).subscribe({
        next: (response) => {
          this.result.set(response);

          if (response.status === 'Completed') {
            clearInterval(pollInterval);
            this.isLoading.set(false);
            this.resultImageUrl.set(response.outputImageUrl || null);
            // Replace preview with result
            if (response.outputImageUrl) {
              this.previewUrl.set(response.outputImageUrl);
            }
          } else if (response.status === 'Failed') {
            clearInterval(pollInterval);
            this.isLoading.set(false);
            this.error.set(
              response.errorMessage || 'Le traitement a échoué'
            );
          }
        },
        error: () => {
          clearInterval(pollInterval);
          this.isLoading.set(false);
          this.error.set('Erreur lors de la vérification du statut');
        },
      });
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (this.isLoading()) {
        this.isLoading.set(false);
        this.error.set('Le traitement prend trop de temps');
      }
    }, 5 * 60 * 1000);
  }

  reset(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.error.set(null);
    this.result.set(null);
    this.resultImageUrl.set(null);
    this.isLoading.set(false);
  }
}
