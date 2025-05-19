import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICategoria } from '../interfaces/categoria.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  constructor(
    private readonly http: HttpClient,
    private authService: AuthService
  ) {}

  listarCategorias(): Observable<ICategoria[]> {
    const headers = this.authService.getToken()
      ? this.authService.createAuthHeader()
      : undefined;

    return this.http.get<ICategoria[]>(this.apiUrl + '/categoria/listar', {
      headers,
    });
  }
}
