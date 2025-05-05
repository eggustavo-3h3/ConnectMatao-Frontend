import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { IUsuario } from '../interfaces/usuario.interface';
import { IEvento } from '../interfaces/evento.interface';
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

  constructor(private http: HttpClient) { }

  logar(
    login: string,
    senha: string
  ): Observable<{ token: string; role: string; userId: string }> {
    return this.http.post<{ token: string; role: string; userId: string }>(
      this.apiUrl + '/autenticar',
      { login, senha }
    );
  }

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
      perfil, // =1
    };

    console.log('Payload de cadastro:', payload);
    return this.http.post<IUsuario>(`${this.apiUrl}/usuario/cadastrar`, payload);
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
    if (this._userId) return this._userId; // Retorna o userId armazenado se já existir

    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Guarda o userId temporariamente para não fazer a leitura novamente
      this._userId =
        payload[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ] || null;
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
    this._userId = null; // Limpa o userId armazenado
    console.log('Saiu.');

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
    return this.isAuthenticated() && this.getRole() === 'Parceiro';
  }

  isAdmin(): boolean {
    return this.isAuthenticated() && this.getRole() === 'Administrador';
  }

  createAuthHeader(): HttpHeaders {
    let token = this.getToken();

    // Verifique o tamanho do token antes de enviá-lo no cabeçalho
    if (token && token.length > 1000) {
      console.warn('Token JWT muito grande, invalidando');
      token = ''; // Limpa o token se ele for muito grande
    }

    // Se o token for válido, cria o cabeçalho de autorização
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
