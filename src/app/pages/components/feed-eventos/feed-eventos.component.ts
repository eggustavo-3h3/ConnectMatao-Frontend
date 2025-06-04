// src/app/components/feed-eventos/feed-eventos.component.ts
import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface'; // Certifique-se que esta interface contém 'isCreatorPartner?: boolean;'
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ParceiroStatusService } from '../../../services/parceiro-status.service'; // Importar o serviço
import { forkJoin, of } from 'rxjs'; // Importar forkJoin e of
import { map, take } from 'rxjs/operators'; // Importar map e take
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para o spinner de carregamento

@Component({
  selector: 'app-feed-eventos',
  templateUrl: './feed-eventos.component.html',
  styleUrls: ['./feed-eventos.component.css'],
  standalone: true, // Adicionado standalone: true se este é um componente standalone
  imports: [
    AngularMaterialModule,
    CommonModule,
    RouterModule,
    MatProgressSpinnerModule, // Adicionado ao imports
  ],
})
export class FeedEventosComponent implements OnChanges {
  eventos: IEventoCard[] = [];
  isLoading = false;

  @Input() categoriaSelecionada: number | null = null;

  private page = 0;
  private readonly limit = 3;
  private allLoaded = false;

  constructor(
    private eventoService: EventoService,
    private parceiroStatusService: ParceiroStatusService // Injetar o serviço
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoriaSelecionada']) {
      this.resetarFeed();
    }
  }

  resetarFeed(): void {
    this.eventos = [];
    this.page = 0;
    this.allLoaded = false;
    this.carregarMaisEventos();
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (this.isNearBottom() && !this.isLoading && !this.allLoaded) {
      this.carregarMaisEventos();
    }
  }

  carregarMaisEventos(): void {
    this.isLoading = true;
    this.parceiroStatusService.clearCache(); // Limpa o cache para garantir dados frescos

    this.eventoService.listarEventos(this.categoriaSelecionada).subscribe({
      next: (todosEventos) => {
        let eventosFiltrados = todosEventos;

        if (this.categoriaSelecionada !== null) {
          const categoriaStr = this.categoriaSelecionada.toString();
          eventosFiltrados = todosEventos.filter(
            (e) => e.categoriaid === categoriaStr
          );
        }

        const novosEventos = eventosFiltrados.slice(
          this.page * this.limit,
          (this.page + 1) * this.limit
        );

        if (novosEventos.length > 0) {
          // Processa cada novo evento para verificar o status do parceiro
          const parceiroChecks = novosEventos.map((evento) => {
            if (evento.usuarioParceiroid) {
              return this.parceiroStatusService
                .isUserApprovedPartner(evento.usuarioParceiroid)
                .pipe(
                  map((isPartner) => {
                    evento.isCreatorPartner = isPartner;
                    return evento;
                  }),
                  take(1) // Importante para que o forkJoin saiba quando o observable terminou
                );
            } else {
              evento.isCreatorPartner = false;
              return of(evento);
            }
          });

          // Usa forkJoin para esperar todas as verificações de parceiro
          forkJoin(parceiroChecks).subscribe(
            (eventosComStatus) => {
              this.eventos = [...this.eventos, ...eventosComStatus];
              this.page++;
              this.isLoading = false;
            },
            (error) => {
              console.error(
                'Erro ao verificar status de parceiro para novos eventos:',
                error
              );
              // Em caso de erro, adicione os eventos sem o status de parceiro
              this.eventos = [
                ...this.eventos,
                ...novosEventos.map((e) => ({ ...e, isCreatorPartner: false })),
              ];
              this.isLoading = false;
            }
          );
        } else {
          this.allLoaded = true;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error.message);
        this.isLoading = false;
      },
    });
  }

  private isNearBottom(): boolean {
    const scrollPosition = window.innerHeight + window.scrollY;
    return scrollPosition >= document.body.scrollHeight - 100;
  }
}
