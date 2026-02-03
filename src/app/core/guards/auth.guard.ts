import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

// canMatch guards - used to determine if a route should be considered for matching
export const authMatch: CanMatchFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

export const guestMatch: CanMatchFn = () => {
  const authService = inject(AuthService);
  return !authService.isAuthenticated();
};
