import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IUsuario } from '../interfaces/usuario.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUser(userId: number): Observable<IUsuario> {
    return this.http
      .get<IUsuario>(`${this.apiUrl}/usuario/${userId}`)
      .pipe(
        catchError((error) =>
          this.handleError<IUsuario>(`getUser id=${userId}`, error)
        )
      );
  }

  private handleError<T>(operation = 'operation', error: any): Observable<any> {
    console.error(`${operation} falhou: ${error.message}`);
    return throwError(error);
  }
}
