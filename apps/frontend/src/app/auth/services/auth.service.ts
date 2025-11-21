import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, tap, catchError } from 'rxjs';
import { LoginRequest, LoginResponse, Admin } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = environment.tokenKey;

  // Signals pour l'état d'authentification
  private readonly currentAdminSignal = signal<Admin | null>(null);
  private readonly isLoadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Exposer les signals en lecture seule
  readonly currentAdmin = this.currentAdminSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signal pour vérifier si l'utilisateur est authentifié
  readonly isAuthenticated = computed(() => this.currentAdminSignal() !== null);

  constructor() {
    // Vérifier le token au démarrage
    this.checkExistingToken();
  }

  private checkExistingToken(): void {
    const token = this.getToken();
    if (token) {
      this.loadAdminProfile();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
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
    this.router.navigate(['/login']);
  }

  private loadAdminProfile(): void {
    const token = this.getToken();
    if (!token) return;

    this.http
      .get<Admin>(`${this.apiUrl}/auth/profile`)
      .pipe(
        tap((admin) => this.currentAdminSignal.set(admin)),
        catchError(() => {
          this.removeToken();
          return throwError(() => new Error('Session expirée'));
        })
      )
      .subscribe();
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

    console.error('Auth error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
