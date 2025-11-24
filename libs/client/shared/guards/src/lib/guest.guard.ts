import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@vera/client/features/auth';

/**
 * Guard pour bloquer l'accès aux pages de non-authentifiés (login)
 * si l'utilisateur est déjà connecté
 */
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Attendre la restauration de la session
  await authService.checkExistingToken();

  if (authService.isAuthenticated()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};
