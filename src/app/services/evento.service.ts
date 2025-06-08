import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { IEvento } from '../interfaces/evento.interface';
import { IEventoCard } from '../interfaces/evento-card.interface';
import { AuthService } from './auth.service';
import { IUsuario } from '../interfaces/usuario.interface';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IEventoEstatisticas } from '../interfaces/evento-estatisticas.interface';
import { TipoEstatistica } from '../enums/tipo-estatistica.enum';

@Injectable({
  providedIn: 'root',
})
export class EventoService {
  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  private getAuthHeaders() {
    return this.authService.createAuthHeader();
  }

  listarEventos(categoriaId: number | null): Observable<IEventoCard[]> {
    const url = categoriaId
      ? `${this.apiUrl}/evento/listar?categoriaId=${categoriaId}`
      : `${this.apiUrl}/evento/listar`;

    return this.http.get<IEventoCard[]>(url).pipe(
      map((eventos) =>
        eventos.map(({ imagens, ...rest }) => rest as IEventoCard)
      ),
      catchError(this.handleError<IEventoCard[]>('listarEventos', []))
    );
  }

  listarEventosMaisCurtidos(limite: number = 8): Observable<IEventoCard[]> {
    const url = `${this.apiUrl}/evento/listar/destaque?limite=${limite}`;
    return this.http
      .get<IEventoCard[]>(url)
      .pipe(
        catchError(
          this.handleError<IEventoCard[]>('listarEventosMaisCurtidos', [])
        )
      );
  }

  criarEvento(evento: IEvento): Observable<IEvento> {
    return this.http.post<IEvento>(`${this.apiUrl}/evento/adicionar`, evento, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  removerEvento(eventoId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/evento/remover/${eventoId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getEventosPorUsuario(usuarioId: string): Observable<IEvento[]> {
    return this.http
      .get<IEventoCard[]>(`${this.apiUrl}/evento/listar/usuario/${usuarioId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        switchMap((eventos) => {
          if (!eventos || eventos.length === 0) {
            return of([]);
          }
          return forkJoin(
            eventos.map((evento) => this.buildEventoListDto(evento))
          );
        }),
        catchError(
          this.handleError<IEvento[]>(
            `getEventosPorUsuario usuarioId=${usuarioId}`,
            []
          )
        )
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  getEventosEstatisticas(
    eventoId: string
  ): Observable<{ likes: number; deslikes: number }> {
    return this.http.get<{ likes: number; deslikes: number }>(
      `${this.apiUrl}/eventos/${eventoId}/estatisticas`,
      { headers: this.getAuthHeaders() }
    );
  }

  private fetchUserInfo(userId: string): Observable<IUsuario | null> {
    return this.http
      .get<IUsuario>(`${this.apiUrl}/usuario/${userId}`)
      .pipe(
        catchError(
          this.handleError<IUsuario | null>(
            `obter info do usuário ${userId}`,
            null
          )
        )
      );
  }

  private buildEventoListDto(evento: IEventoCard): Observable<IEvento> {
    if (!evento) {
      return of({} as IEventoCard);
    }

    const usuarioId = evento.usuarioParceiroid;

    return this.fetchUserInfo(usuarioId).pipe(
      map((userInfo) => {
        const usuarioImageUrl = userInfo?.imagem
          ? this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:image/png;base64,${userInfo.imagem}`
            )
          : this.sanitizer.bypassSecurityTrustResourceUrl(
              'assets/perfil-placeholder.png'
            );

        let imagemUrl: SafeUrl;
        const imagens = evento.eventoImagem;

        const eventoDto: IEventoCard = {
          ...evento,
          usuarioNome: userInfo?.nome || '',
          usuarioImagem: userInfo?.imagem || '',
        };
        return eventoDto;
      }),
      catchError((error) => {
        console.error('Erro no buildEventoListDto:', error);
        return of({} as IEventoCard);
      })
    );
  }

  interagirEvento(eventoId: string, tipo: TipoEstatistica): Observable<void> {
    let url = '';
    if (tipo === TipoEstatistica.like) {
      url = `${this.apiUrl}/eventos/${eventoId}/likes`;
    } else if (tipo === TipoEstatistica.deslike) {
      url = `${this.apiUrl}/eventos/${eventoId}/deslikes`;
    }

    return this.http
      .post<void>(url, {}, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => {
          console.log(
            `Evento ${eventoId} ${
              tipo === TipoEstatistica.like ? 'curtido' : 'descurtido'
            } com sucesso.`
          );
        }),
        catchError((error) => {
          console.error(
            `Erro ao interagir no evento ${eventoId} (${
              tipo === TipoEstatistica.like ? 'like' : 'dislike'
            }):`,
            error
          );
          throw error;
        })
      );
  }

  removerLike(eventoId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/eventos/${eventoId}/likes`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          console.log(`Like removido do evento ${eventoId}.`);
        }),
        catchError((error) => {
          console.error(`Erro ao remover like do evento ${eventoId}:`, error);
          throw error;
        })
      );
  }

  removerDislike(eventoId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/eventos/${eventoId}/deslikes`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap(() => {
          console.log(`Dislike removido do evento ${eventoId}.`);
        }),
        catchError((error) => {
          console.error(
            `Erro ao remover dislike do evento ${eventoId}:`,
            error
          );
          throw error;
        })
      );
  }

  getEventoPorId(eventId: string): Observable<IEvento> {
    return this.http.get<IEvento>(`${this.apiUrl}/evento/${eventId}/detalhe`, {
      headers: this.getAuthHeaders(),
    });
  }

  searchEvents(term: string): Observable<IEvento[]> {
    if (!term || term.trim() === '') {
      return of([]);
    }
    const url = `${
      this.apiUrl
    }/evento/listar/titulo?titulo=${encodeURIComponent(term)}`;
    return this.http.get<IEvento[]>(url).pipe(
      catchError((error) => {
        console.error('Erro ao pesquisar eventos por título:', error);
        return of([]);
      })
    );
  }
}
