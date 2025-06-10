import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { MatIconModule } from '@angular/material/icon';
import { ParceiroStatusService } from '../../../services/parceiro-status.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';
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
export class CardEventosComponent implements OnInit, OnDestroy {
  eventos: IEventoCard[] = [];
  currentIndex = 0;
  visibleCards = 3;
  cardWidthPercentage = 100 / this.visibleCards;
  isLoading = false;

  private subscriptions: Subscription = new Subscription();
  private readonly MAX_DESTAQUES = 8;

  constructor(
    private eventoService: EventoService,
    private parceiroStatusService: ParceiroStatusService
  ) {}

  ngOnInit(): void {
    this.updateVisibleCards();
    window.addEventListener('resize', this.updateVisibleCards.bind(this));
    this.carregarEventosDestaque();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    window.removeEventListener('resize', this.updateVisibleCards.bind(this));
  }

  @HostListener('window:resize')
  onResize(): void {
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
    this.currentIndex = 0;
  }

  carregarEventosDestaque(): void {
    this.isLoading = true;
    this.eventos = [];
    this.currentIndex = 0;
    this.parceiroStatusService.clearCache();

    const sub = this.eventoService
      .listarEventosMaisCurtidos(this.MAX_DESTAQUES)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (eventosRecebidos) => {
          if (eventosRecebidos.length === 0) {
            this.eventos = [];
            return;
          }

          const parceiroChecks = eventosRecebidos.map((evento) => {
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
              this.eventos = eventosComStatus;
            },
            (error) => {
              console.error(
                'Erro ao verificar status de parceiro para eventos:',
                error
              );
              this.eventos = eventosRecebidos.map((evento) => ({
                ...evento,
                isCreatorPartner: false,
              }));
            }
          );
        },
        error: (erro) => {
          console.error('Erro ao carregar eventos em destaque:', erro.message);
          this.eventos = [];
        },
      });
    this.subscriptions.add(sub);
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
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
