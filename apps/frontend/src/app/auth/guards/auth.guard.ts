import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si déjà authentifié, autoriser l'accès
  if (authService.isAuthenticated()) {
    return true;
  }

  // Vérifier s'il y a un token stocké
  const token = authService.getToken();
  if (!token) {
    // Pas de token, redirection silencieuse vers login
    router.navigate(['/login']);
    return false;
  }

  // Token trouvé, tenter de restaurer la session
  console.log('🔑 Token found, attempting to restore session...');
  const isValid = await authService.checkExistingToken();

  if (isValid && authService.isAuthenticated()) {
    console.log('✅ Session restored successfully');
    return true;
  }

  // Token invalide ou expiré
  console.log('❌ Token expired or invalid, redirecting to login');
  router.navigate(['/login']);
  return false;
};
