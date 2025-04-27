import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEvento } from '../interfaces/evento.interface';
import { IEventoCard } from '../interfaces/evento-card.interface';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';
  /*categorias: ICategoria[] = [];
  categoriaIdSelecionada!: number;*/

  constructor(
    private http: HttpClient,
  ) { }

  listarEventos(): Observable<IEventoCard[]> {
    return this.http.get<IEventoCard[]>(this.apiUrl + '/evento/listar');
  }

  criarEvento(evento: IEvento): Observable<IEvento> {
    return this.http.post<IEvento>(this.apiUrl + '/evento/adicionar', evento)
  }
}
