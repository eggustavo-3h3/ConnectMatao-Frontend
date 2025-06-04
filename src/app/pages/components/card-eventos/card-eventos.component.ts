// src/app/components/card-eventos/card-eventos.component.ts
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { MatIconModule } from '@angular/material/icon';
import { ParceiroStatusService } from '../../../services/parceiro-status.service';
import { Subscription, forkJoin, of } from 'rxjs'; // Importe forkJoin e of
import { map, take } from 'rxjs/operators'; // Importe map e take
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-card-eventos',
  templateUrl: './card-eventos.component.html',
  styleUrls: ['./card-eventos.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class CardEventosComponent implements OnChanges, OnInit, OnDestroy {
  @Input() categoriaSelecionada: number | null = null;

  eventos: IEventoCard[] = [];
  currentIndex = 0;
  visibleCards = 3;
  cardWidthPercentage = 100 / this.visibleCards;
  isLoading = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private eventoService: EventoService,
    private parceiroStatusService: ParceiroStatusService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoriaSelecionada']) {
      this.listarEventos();
    }
  }

  ngOnInit(): void {
    this.updateVisibleCards();
    window.addEventListener('resize', this.updateVisibleCards.bind(this));
    this.listarEventos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    window.removeEventListener('resize', this.updateVisibleCards.bind(this));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event): void {
    this.updateVisibleCards();
  }

  updateVisibleCards(): void {
    if (window.innerWidth <= 768) {
      this.visibleCards = 1;
    } else if (window.innerWidth <= 1024) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 3;
    }
    this.cardWidthPercentage = 100 / this.visibleCards;
  }

  listarEventos(): void {
    this.isLoading = true;
    this.eventos = [];
    this.parceiroStatusService.clearCache(); // É uma boa prática limpar o cache ao carregar novos eventos

    const sub = this.eventoService
      .listarEventos(this.categoriaSelecionada)
      .subscribe({
        next: (eventosRecebidos) => {
          if (eventosRecebidos.length === 0) {
            this.eventos = [];
            this.isLoading = false;
            return;
          }

          // Crie um array de Observables, um para cada verificação de parceiro
          const parceiroChecks = eventosRecebidos.map((evento) => {
            // Use evento.usuarioParceiroid, que é a propriedade que você tem
            if (evento.usuarioParceiroid) {
              return this.parceiroStatusService
                .isUserApprovedPartner(evento.usuarioParceiroid)
                .pipe(
                  map((isPartner) => {
                    // Adiciona a propriedade isCreatorPartner ao objeto evento
                    evento.isCreatorPartner = isPartner;
                    return evento; // Retorna o evento modificado
                  }),
                  take(1) // Garante que cada observable complete após a primeira emissão
                );
            } else {
              // Se não houver usuarioParceiroid, defina isCreatorPartner como false
              evento.isCreatorPartner = false;
              return of(evento); // Retorna um Observable do evento não modificado
            }
          });

          // Usa forkJoin para esperar que todas as chamadas de parceiro sejam concluídas
          forkJoin(parceiroChecks).subscribe(
            (eventosComStatus) => {
              this.eventos = eventosComStatus;
              this.isLoading = false;
            },
            (error) => {
              console.error(
                'Erro ao verificar status de parceiro para eventos:',
                error
              );
              // Em caso de erro em qualquer verificação, exibe os eventos sem o status de parceiro
              this.eventos = eventosRecebidos.map((evento) => ({
                ...evento,
                isCreatorPartner: false,
              }));
              this.isLoading = false;
            }
          );
        },
        error: (erro) => {
          console.error('Erro ao carregar eventos:', erro.message);
          this.isLoading = false;
        },
      });
    this.subscriptions.add(sub);
  }

  // O método isPartnerCreator não é mais necessário aqui,
  // pois o status é atribuído diretamente ao objeto evento.

  prevSlide(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  nextSlide(): void {
    if (this.currentIndex < this.eventos.length - this.visibleCards) {
      this.currentIndex++;
    }
  }

  isPrevDisabled(): boolean {
    return this.currentIndex === 0;
  }

  isNextDisabled(): boolean {
    return this.currentIndex >= this.eventos.length - this.visibleCards;
  }
}
