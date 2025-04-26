import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as Array<string> | undefined;

  if (!authService.isAuthenticated()) {
    console.log('Usuário não autenticado.');
    return router.createUrlTree(['/login']);
  }

  if (expectedRoles && expectedRoles.length > 0) {
    const userRole = authService.getRole();
    if (!expectedRoles.includes(userRole!)) {
      console.log('Usuário autenticado, mas sem permissão.');
      return router.createUrlTree(['/acesso-negado']);
    }
  }

  return true;
};
