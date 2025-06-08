import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { IUsuario } from '../interfaces/usuario.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserProfileById(userId: string): Observable<IUsuario> {
    const url = `${this.apiUrl}/usuario/${userId}`;
    return this.http.get<IUsuario>(url).pipe(
      catchError((error) => {
        console.error('Erro ao obter perfil:', error);
        return throwError(() => new Error('Erro ao obter perfil do usuário.'));
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getUser(userId: string | number): Observable<IUsuario> {
    const url = `${this.apiUrl}/usuario/${userId}`;
    return this.http.get<IUsuario>(url).pipe(
      catchError((error) => {
        console.error('Erro ao obter usuário:', error);
        return throwError(() => new Error('Erro ao obter usuário.'));
      })
    );
  }

  updateUserProfile(profileData: IUsuario): Observable<any> {
    const userId = this.authService.getUserId();

    if (!userId) {
      console.error('Erro: usuário não autenticado');
      return throwError(() => new Error('Usuário não autenticado.'));
    }

    const normalizedUserId = userId.trim().toLowerCase();
    const normalizedProfileId = String(profileData.id).trim().toLowerCase();

    if (normalizedProfileId !== normalizedUserId) {
      console.error(
        `Erro: ID do perfil (${normalizedProfileId}) não corresponde ao ID do usuário autenticado (${normalizedUserId})`
      );
      return throwError(
        () => new Error('Usuário não autenticado ou sem permissão.')
      );
    }

    console.log('ID do usuário autenticado:', normalizedUserId);
    console.log('ID do perfil:', normalizedProfileId);

    return this.http
      .put(`${this.apiUrl}/usuario/atualizar`, profileData, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Erro ao atualizar perfil do usuário:', error);
          return throwError(() => new Error('Erro ao atualizar perfil.'));
        })
      );
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<any> {
    const url = `${this.apiUrl}/usuario/alterar-senha`;
    const body = { senhaAtual, novaSenha };
    const headers = this.getAuthHeaders();

    return this.http.put(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Erro ao alterar senha:', error);
        return throwError(() => new Error('Erro ao alterar senha.'));
      })
    );
  }

  getPerfilUsuario(): Observable<IUsuario> {
    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('Usuário não autenticado.'));
    }
    return this.getUser(userId);
  }

  getImagemUsuarioPorId(usuarioId: string): Observable<string> {
    const url = `${this.apiUrl}/usuario/${usuarioId}/imagem`;
    return this.http.get<{ imagem: string }>(url).pipe(
      map((response) => response.imagem),
      catchError((error) => {
        console.error('Erro ao obter imagem do usuário:', error);
        return throwError(() => new Error('Erro ao obter imagem.'));
      })
    );
  }

  solicitarRecuperacaoSenha(email: string): Observable<any> {
    const url = `${this.apiUrl}/gerar-chave-reset-senha`;
    return this.http.post(url, { email }).pipe(
      catchError((error) => {
        console.error('Erro ao solicitar recuperação de senha:', error);
        return throwError(() => new Error('Erro ao solicitar recuperação.'));
      })
    );
  }

  resetarSenhaComChave(dadosFormulario: any): Observable<any> {
    const url = `${this.apiUrl}/resetar-senha`;
    return this.http.put(url, dadosFormulario).pipe(
      catchError((error) => {
        console.error('Erro ao resetar senha com chave:', error);
        return throwError(() => new Error('Erro ao redefinir senha.'));
      })
    );
  }
}
