// Mit KI erstellt (Gemini, KI-Log W3, 13.10.), vom Team getestet und bewertet.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const role = (auth.currentUser()?.role || '').toLowerCase();
    if (role === 'admin' || role === 'organizer') {
      return true;
    }
  }

  router.navigate(['/login']);
  return false;
};