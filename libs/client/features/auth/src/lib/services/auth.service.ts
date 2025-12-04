import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { LoginRequest, LoginResponse, Admin } from '@vera/shared/models';
import { environment } from '@env';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = environment.tokenKey;

  private readonly currentAdminSignal = signal<Admin | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly currentAdmin = this.currentAdminSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentAdminSignal() !== null);

  checkExistingToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return Promise.resolve(false);
    }

    this.isLoadingSignal.set(true);
    return new Promise((resolve) => {
      this.loadAdminProfile().subscribe({
        next: () => {
          this.isLoadingSignal.set(false);
          resolve(true);
        },
        error: () => {
          this.isLoadingSignal.set(false);
          resolve(false);
        },
      });
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.saveToken(response.accessToken);
          this.currentAdminSignal.set(response.admin);
          this.isLoadingSignal.set(false);
        }),
        catchError((error) => this.handleError(error))
      );
  }

  logout(): void {
    this.removeToken();
    this.currentAdminSignal.set(null);
    this.router.navigate(['/']);
  }

  private loadAdminProfile(): Observable<Admin> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.get<Admin>(`${this.apiUrl}/profile`).pipe(
      tap((admin) => {
        this.currentAdminSignal.set(admin);
      }),
      catchError(() => {
        this.removeToken();
        this.currentAdminSignal.set(null);
        return throwError(() => new Error('Session expirée'));
      })
    );
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.isLoadingSignal.set(false);

    const errorMessage =
      error.error?.message || 'Une erreur est survenue lors de la connexion';
    this.errorSignal.set(errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}
