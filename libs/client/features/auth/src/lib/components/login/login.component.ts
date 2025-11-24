import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '@vera/shared/models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    email: [''],
    password: [''],
  });

  isLoading = this.authService.isLoading;
  error = this.authService.error;

  onSubmit(): void {
    if (this.form.valid) {
      const credentials: LoginRequest = {
        email: this.form.value.email || '',
        password: this.form.value.password || '',
      };

      this.authService.login(credentials).subscribe({
        next: () => this.router.navigate(['/admin']),
        error: (error) => console.error('Login error:', error),
      });
    }
  }
}
