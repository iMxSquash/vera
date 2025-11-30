import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env';

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

export interface ReferenceImage {
  id: string;
  supabaseUrl: string;
  bucketName: string;
  filePath: string;
  isActive: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class FaceSwapService {
  private readonly apiUrl = `${environment.serverUrl}/api/face-swap`;

  constructor(private http: HttpClient) {}

  uploadAndSwap(file: File, userId: string): Observable<FaceSwapResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);

    return this.http.post<FaceSwapResponse>(`${this.apiUrl}/upload`, formData);
  }

  getTaskStatus(taskId: string): Observable<FaceSwapResponse> {
    return this.http.get<FaceSwapResponse>(`${this.apiUrl}/${taskId}`);
  }

  getReferenceImages(): Observable<ReferenceImage[]> {
    return this.http.get<ReferenceImage[]>(
      `${this.apiUrl}/reference-images/list`
    );
  }

  uploadReferenceImage(file: File): Observable<ReferenceImage> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<ReferenceImage>(
      `${this.apiUrl}/reference-images`,
      formData
    );
  }

  deleteReferenceImage(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/reference-images/${id}`
    );
  }

  toggleReferenceImageStatus(id: string): Observable<ReferenceImage> {
    return this.http.patch<ReferenceImage>(
      `${this.apiUrl}/reference-images/${id}/toggle`,
      {}
    );
  }
}
