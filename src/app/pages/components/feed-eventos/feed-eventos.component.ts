import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ParceiroStatusService } from '../../../services/parceiro-status.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-feed-eventos',
  templateUrl: './feed-eventos.component.html',
  styleUrls: ['./feed-eventos.component.css'],
  standalone: true,
  imports: [
    AngularMaterialModule,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule,
  ],
})
export class FeedEventosComponent implements OnInit, OnChanges {
  eventos: IEventoCard[] = [];
  isLoading = false;
  showLoadingSpinner = false;

  @Input() termoPesquisa: string | null = null;
  @Input() categoriaSelecionada: number | null = null;

  private page = 0;
  private readonly limit = 3;
  private allLoaded = false;
  private initialLoadDone = false;

  constructor(
    private eventoService: EventoService,
    private parceiroStatusService: ParceiroStatusService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.termoPesquisa && !this.categoriaSelecionada) {
      this.resetarFeed();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoriaSelecionada'] || changes['termoPesquisa']) {
      this.resetarFeed();
    }
  }

  resetarFeed(): void {
    this.eventos = [];
    this.page = 0;
    this.allLoaded = false;
    this.initialLoadDone = false;
    this.showLoadingSpinner = false;
    this.carregarMaisEventos();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.isNearBottom() && !this.isLoading && !this.allLoaded) {
      this.showLoadingSpinner = true;
      this.carregarMaisEventos();
    }
  }

  carregarMaisEventos(): void {
    this.isLoading = true;
    this.parceiroStatusService.clearCache();

    let eventosObservable: Observable<IEventoCard[]>;

    if (this.termoPesquisa) {
      eventosObservable = this.eventoService
        .searchEvents(this.termoPesquisa)
        .pipe(map((eventos) => eventos as IEventoCard[]));
    } else {
      eventosObservable = this.eventoService.listarEventos(
        this.categoriaSelecionada
      );
    }

    eventosObservable.subscribe({
      next: (todosEventos) => {
        let eventosParaExibir = todosEventos;

        if (this.categoriaSelecionada !== null && !this.termoPesquisa) {
          const categoriaStr = this.categoriaSelecionada.toString();
          eventosParaExibir = todosEventos.filter(
            (e) => e.categoriaid === categoriaStr
          );
        }

        if (!this.initialLoadDone && eventosParaExibir.length === 0) {
          this.isLoading = false;
          this.allLoaded = true;
          this.initialLoadDone = true;
          this.showLoadingSpinner = false;
          return;
        }

        const novosEventos = eventosParaExibir.slice(
          this.page * this.limit,
          (this.page + 1) * this.limit
        );

        if (novosEventos.length > 0) {
          const parceiroChecks = novosEventos.map((evento) => {
            if (evento.usuarioParceiroid) {
              return this.parceiroStatusService
                .isUserApprovedPartner(evento.usuarioParceiroid)
                .pipe(
                  map((isPartner) => {
                    evento.isCreatorPartner = isPartner;
                    return evento;
                  }),
                  take(1)
                );
            } else {
              evento.isCreatorPartner = false;
              return of(evento);
            }
          });

          forkJoin(parceiroChecks).subscribe(
            (eventosComStatus) => {
              this.eventos = [...this.eventos, ...eventosComStatus];
              this.page++;
              this.isLoading = false;
              this.initialLoadDone = true;
              this.showLoadingSpinner = false;
            },
            (error) => {
              console.error(
                'Erro ao verificar status de parceiro para novos eventos:',
                error
              );
              this.eventos = [
                ...this.eventos,
                ...novosEventos.map((e) => ({ ...e, isCreatorPartner: false })),
              ];
              this.isLoading = false;
              this.initialLoadDone = true;
              this.showLoadingSpinner = false;
            }
          );
        } else {
          this.allLoaded = true;
          this.isLoading = false;
          this.initialLoadDone = true;
          this.showLoadingSpinner = false;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error.message);
        this.isLoading = false;
        this.initialLoadDone = true;
        this.showLoadingSpinner = false;
      },
    });
  }

  private isNearBottom(): boolean {
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = 100;
    return scrollPosition >= document.body.scrollHeight - threshold;
  }
}
