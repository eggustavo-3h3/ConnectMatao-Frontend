import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { IEvento } from '../interfaces/evento.interface';
import { IEventoEstatisticas } from '../interfaces/evento-estatisticas.interface';
import { UsuarioService } from './usuario.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TipoEstatistica } from '../enums/tipo-estatistica.enum';
import { IEventoImagens } from '../interfaces/evento-imagens.interface';
import { ICategoria } from '../interfaces/categoria.interface';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  categorias: ICategoria[] = [];
  categoriaIdSelecionada!: number;

  constructor(
    private http: HttpClient,
    private usuarioService: UsuarioService,
    private sanitizer: DomSanitizer
  ) {}

  listarEventos(): Observable<IEvento[]> {
    return this.http.get<IEvento[]>(this.apiUrl + '/evento/listar');
  }

  criarEvento(evento: IEvento): Observable<IEvento> {
    return this.http.post<IEvento>(this.apiUrl + '/evento/adicionar', evento);
  }
}
