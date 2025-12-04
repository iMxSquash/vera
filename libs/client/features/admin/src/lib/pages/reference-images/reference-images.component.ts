import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@vera/client/shared/environments';

interface ReferenceImage {
  id: string;
  supabaseUrl: string;
  bucketName: string;
  filePath: string;
  isActive: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-reference-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reference-images.component.html',
})
export class ReferenceImagesComponent implements OnInit {
  images = signal<ReferenceImage[]>([]);
  isLoading = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);

  private readonly apiUrl = `${environment.serverUrl}/api/face-swap/reference-images`;

  // 👉 Standalone = utilise plutôt inject()
  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadImages();
  }

  // === ROUTER ACTIVE UTILITY ===
  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  // === API CALLS ===
  loadImages(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ReferenceImage[]>(`${this.apiUrl}/list`).subscribe({
      next: (images) => {
        this.images.set(images);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Erreur lors du chargement des images');
        this.isLoading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadImage(input.files[0]);
    }
  }

  uploadImage(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.error.set('Veuillez sélectionner une image valide');
      return;
    }

    this.uploading.set(true);
    this.error.set(null);

    const formData = new FormData();
    formData.append('image', file);

    this.http.post<ReferenceImage>(this.apiUrl, formData).subscribe({
      next: () => {
        this.uploading.set(false);
        this.loadImages();
      },
      error: () => {
        this.uploading.set(false);
        this.error.set("Erreur lors de l'upload de l'image");
      },
    });
  }

  deleteImage(id: string): void {
    if (!confirm('Voulez-vous vraiment supprimer cette image ?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadImages(),
      error: () => this.error.set('Erreur lors de la suppression de l\'image'),
    });
  }

  toggleStatus(id: string): void {
    this.http.patch<ReferenceImage>(`${this.apiUrl}/${id}/toggle`, {}).subscribe({
      next: () => this.loadImages(),
      error: () => this.error.set('Erreur lors de la modification du statut'),
    });
  }

  trackById(index: number, item: ReferenceImage) {
    return item.id;
  }

}
