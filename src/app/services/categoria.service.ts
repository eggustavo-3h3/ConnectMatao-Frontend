import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';;
import { ICategoria } from '../interfaces/categoria.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';


  constructor(
    private readonly http: HttpClient,
  ) { }

  listarCategorias(): Observable<ICategoria[]> {
    return this.http.get<ICategoria[]>(this.apiUrl + '/categoria/listar');
  }
}
