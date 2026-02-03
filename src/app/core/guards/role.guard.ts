import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../../models';

export function roleGuard(...allowedRoles: Role[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole(...allowedRoles)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
}

export const adminGuard: CanActivateFn = roleGuard('admin');
export const userGuard: CanActivateFn = roleGuard('user', 'admin');
