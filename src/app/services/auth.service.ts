import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { IUsuario } from '../interfaces/usuario.interface';
import { IEvento } from '../interfaces/evento.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';
  private tokenKey = 'authToken';
  private roleKey = 'userRole';

  isLoggedIn$ = new BehaviorSubject<boolean>(this.isAuthenticated());

  constructor(private http: HttpClient) {}

  logar(
    login: string,
    senha: string
  ): Observable<{ token: string; role: string; userId: string }> {
    return this.http.post<{ token: string; role: string; userId: string }>(
      this.apiUrl + '/autenticar',
      { login, senha }
    );
  }

  register(nome: string, email: string, senha: string): Observable<any> {
    const userDetails = {
      Nome: nome,
      Login: email,
      Senha: senha,
      Perfil: 'Comum',
    };
    return this.http.post(`${this.apiUrl}/usuario/cadastrar`, userDetails);
  }

  saveAuthInfo(token: string, role: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    this.isLoggedIn$.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log(payload);
      return (
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] || null
      );
    } catch (e) {
      console.error('Erro ao decodificar o token:', e);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.isLoggedIn$.next(false);
    console.log('Saiu.');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isPartner(): boolean {
    return this.isAuthenticated() && this.getRole() === 'Parceiro';
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.getRole() === 'Administrador';
  }

  createAuthHeader(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  // getEventsByUser(userId: string): Observable<IEvento[]> {
  //   const headers = this.createAuthHeader();
  //   if (!this.isAuthenticated() || !headers.get('Authorization')) {
  //     console.warn('Sem autorização para ver eventos do usuário.');
  //     return of([]);
  //   }
  //   return this.http.get<IEvento[]>(
  //     `${this.apiUrl}/evento/listar/usuario/${userId}`,
  //     { headers }
  //   );
  // }
}
