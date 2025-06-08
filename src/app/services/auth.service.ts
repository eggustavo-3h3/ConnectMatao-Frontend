import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { IUsuario } from '../interfaces/usuario.interface';
import { Perfil } from '../enums/perfil.enum';
import { map, switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';
  private tokenKey = 'authToken';
  private roleKey = 'userRole';

  isLoggedIn$ = new BehaviorSubject<boolean>(this.isAuthenticated());
  private _userId: string | null = null;

  constructor(private http: HttpClient) {}

  logar(
    login: string,
    senha: string
  ): Observable<{ token: string; role: string; userId: string }> {
    return this.http.post<{ token: string; role: string; userId: string }>(
      `${this.apiUrl}/autenticar`,
      { login, senha }
    );
  }

  register(
    nome: string,
    email: string,
    senha: string,
    confirmacaoSenha: string,
    imagem: string = '',
    perfil: number
  ): Observable<IUsuario> {
    const payload = {
      nome,
      login: email, // O login será o email
      senha,
      confirmacaoSenha,
      imagem,
      perfil,
    };

    console.log('Payload de cadastro:', payload);
    return this.http.post<IUsuario>(
      `${this.apiUrl}/usuario/cadastrar`,
      payload
    );
  }

  saveAuthInfo(token: string, role: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    this.isLoggedIn$.next(true);
    this._userId = null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  getUserId(): string | null {
    if (this._userId) return this._userId;

    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this._userId = payload['Id'] || null;
      return this._userId;
    } catch (e) {
      console.error('Erro ao decodificar o token:', e);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    this.isLoggedIn$.next(false);
    this._userId = null;
    console.log('Usuário deslogado.');

    document.cookie =
      'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp;
      if (expiration && Date.now() >= expiration * 1000) {
        console.warn('Token expirado!');
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      console.error('Erro ao verificar expiração do token:', e);
      return false;
    }
  }

  isPartner(): boolean {
    const roleFromToken = this.getRole();
    return this.isAuthenticated() && roleFromToken === Perfil.Parceiro;
  }

  isAdmin(): boolean {
    const roleFromToken = this.getRole();
    return this.isAuthenticated() && roleFromToken === Perfil.Administrador;
  }

  createAuthHeader(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }
    return new HttpHeaders();
  }

  isPartnerApproved(): Observable<boolean> {
    const userId = this.getUserId();
    if (!userId || !this.isPartner()) {
      return of(false);
    }

    return this.http
      .get<{ flagAprovado: boolean; formExists: boolean }>(
        `${this.apiUrl}/parceiro/status-cadastro`,
        { headers: this.createAuthHeader() }
      )
      .pipe(
        map((response) => response.flagAprovado),
        catchError((error) => {
          console.error(
            'Erro ao verificar status de aprovação do parceiro:',
            error
          );
          return of(false);
        })
      );
  }
}
