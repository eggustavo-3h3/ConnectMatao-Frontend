import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IUsuario } from '../interfaces/usuario.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Buscar perfil por ID (qualquer usuário)

  getUserProfileById(userId: string): Observable<IUsuario> {
    const url = `${this.apiUrl}/usuario/${userId}`; // Certifique-se de que o userId está sendo concatenado corretamente
    return this.http.get<IUsuario>(url);
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.createAuthHeader();
  }

  private handleError<T>(operation = 'operation', error: any): Observable<any> {
    console.error(`${operation} falhou: ${error.message}`);
    return throwError(() => new Error(`${operation} falhou: ${error.message}`));
  }

  getUser(userId: string | number): Observable<IUsuario> {
    return this.http.get<IUsuario>(`${this.apiUrl}/usuario/${userId}`);
  }

  // Atualizar perfil do usuário autenticado
  updateUserProfile(profileData: IUsuario): Observable<any> {
    const userId = this.authService.getUserId();

    // Verifica se o usuário está logado e se o ID enviado corresponde ao logado
    if (!userId || profileData.id !== Number(userId)) {
      console.error(
        'Erro ao atualizar perfil: usuário não autenticado ou ID não corresponde.'
      );
      return throwError(
        () => new Error('Usuário não autenticado ou sem permissão.')
      );
    }

    return this.http
      .put(`${this.apiUrl}/usuario/atualizar`, profileData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) =>
          this.handleError('Erro ao atualizar perfil do usuário', error)
        )
      );
  }
}
