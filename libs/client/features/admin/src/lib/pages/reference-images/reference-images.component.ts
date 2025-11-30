import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  styleUrl: './reference-images.component.css',
})
export class ReferenceImagesComponent implements OnInit {
  images = signal<ReferenceImage[]>([]);
  isLoading = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);

  private readonly apiUrl = `${environment.serverUrl}/api/face-swap/reference-images`;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadImages();
  }

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
        this.loadImages(); // Reload the list
      },
      error: () => {
        this.uploading.set(false);
        this.error.set('Erreur lors de l\'upload de l\'image');
      },
    });
  }

  deleteImage(id: string): void {
    if (!confirm('Voulez-vous vraiment supprimer cette image ?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.loadImages(); // Reload the list
      },
      error: () => {
        this.error.set('Erreur lors de la suppression de l\'image');
      },
    });
  }

  toggleStatus(id: string): void {
    this.http.patch<ReferenceImage>(`${this.apiUrl}/${id}/toggle`, {}).subscribe({
      next: () => {
        this.loadImages(); // Reload the list
      },
      error: () => {
        this.error.set('Erreur lors de la modification du statut');
      },
    });
  }
}
