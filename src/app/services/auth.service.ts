import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { IUsuario } from '../interfaces/usuario.interface';
import { Perfil } from '../enums/perfil.enum';

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

  // Faz login e retorna token, role e userId
  logar(
    login: string,
    senha: string
  ): Observable<{ token: string; role: string; userId: string }> {
    return this.http.post<{ token: string; role: string; userId: string }>(
      `${this.apiUrl}/autenticar`,
      { login, senha }
    );
  }

  // Cadastro de usuário
  register(
    nome: string,
    email: string,
    senha: string,
    confirmacaoSenha: string,
    imagem: string = '',
    perfil: Perfil = Perfil.Usuario
  ): Observable<IUsuario> {
    const payload = {
      nome,
      login: email,
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

  // Salva token e role no localStorage e atualiza BehaviorSubject
  saveAuthInfo(token: string, role: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    this.isLoggedIn$.next(true);
    this._userId = null; // Limpa o userId cacheado para forçar decodificação nova se necessário
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  // Decodifica o userId do token JWT e cacheia o resultado
  getUserId(): string | null {
    if (this._userId) return this._userId;

    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload do token:', payload); // log para debug

      // Ajuste aqui para pegar a claim correta
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

    // Limpar cookie authToken caso exista
    document.cookie =
      'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  // Verifica se o token existe e não expirou
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
    return this.isAuthenticated() && this.getRole() === 'Parceiro';
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.getRole() === 'Administrador';
  }

  // Cria HttpHeaders com o token JWT para autorização, se presente
  createAuthHeader(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }
    return new HttpHeaders(); // Não adiciona Authorization
  }
}
