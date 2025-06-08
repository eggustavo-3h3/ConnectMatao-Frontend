// auth.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormUsuarioParceiroService } from '../services/form-usuario-parceiro.service';
import { Perfil } from '../enums/perfil.enum';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const formParceiroService = inject(FormUsuarioParceiroService);
  const snackBar = inject(MatSnackBar);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data['roles'] as Array<string>;
  const userRole: string | null = authService.getRole();

  if (requiredRoles && requiredRoles.length > 0) {
    if (userRole === null || !requiredRoles.includes(userRole)) {
      snackBar.open(
        'Você não tem permissão para acessar esta página.',
        'Fechar',
        { duration: 3000, panelClass: ['snackbar-error'] }
      );
      router.navigate(['/acesso-negado']);
      return false;
    }
  }

  if (state.url.startsWith('/divulgarEvento')) {
    if (userRole?.trim().toLowerCase() === Perfil.Parceiro.toLowerCase()) {
      return formParceiroService.getLoggedUserPartnerStatus().pipe(
        take(1),
        map((status) => {
          const isApproved = status.flagAprovadoParceiro ?? false;
          const hasSubmittedForm = status.formParceiroExiste ?? false;

          if (isApproved) {
            return true;
          } else if (hasSubmittedForm) {
            snackBar.open(
              'Seu cadastro de parceiro está em análise.',
              'Entendi',
              { duration: 5000, panelClass: ['snackbar-info'] }
            );
            router.navigate(['/login']);
            return false;
          } else {
            snackBar.open(
              'Preencha o formulário de cadastro de parceiro para divulgar eventos.',
              'Entendi',
              { duration: 5000, panelClass: ['snackbar-warning'] }
            );
            router.navigate(['/login']);
            return false;
          }
        }),
        catchError((error) => {
          console.error(
            'Erro ao verificar status de parceiro no authGuard:',
            error
          );
          snackBar.open(
            'Erro ao verificar seu status de parceiro. Tente novamente mais tarde.',
            'Fechar',
            { duration: 5000, panelClass: ['snackbar-error'] }
          );
          router.navigate(['/login']);
          return of(false);
        })
      );
    }
  }

  return true;
};
