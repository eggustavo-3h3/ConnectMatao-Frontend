import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { IEvento } from '../../../interfaces/evento.interface';
import { TipoEstatistica } from '../../../enums/tipo-estatistica.enum';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-evento-detalhes',
  templateUrl: './card-evento-detalhes.component.html',
  styleUrls: ['./card-evento-detalhes.component.css'],
  imports: [
    CommonModule, 
  ],
})
export class CardEventoDetalhesComponent implements OnInit {
  eventId: string | null = null; 
  event: IEvento | null = null; 
  usuario: IEventoCard | null = null;
  modalOpen = false; 
  categoriaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('eventId');
      console.log('eventId recuperado: ', this.eventId);
      
      if (this.eventId) {
        this.carregarDetalhesEvento(this.eventId);
      } else {
        console.log('eventId não encontrado ');
      }
    });

    
    if (this.categoriaId) {
      this.carregarEventos();
    }
  }

  carregarDetalhesEvento(eventId: string): void {
    this.eventoService.getEventoPorId(eventId).subscribe({
      next: (evento) => {
        this.event = evento;
        console.log('Detalhes do evento carregados:', this.event);
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do evento:', error);
      },
    });
  }

  carregarEventos(): void {
    this.eventoService.listarEventos(this.categoriaId).subscribe({
      next: (eventos) => {
        console.log('Eventos carregados com sucesso:', eventos);
      },
      error: (error) => {
        console.error('Erro ao carregar eventos:', error);
      },
    });
  }

  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  likeEvento(): void {
    if (this.eventId) {
      this.eventoService
        .interagirEvento(this.eventId, TipoEstatistica.like)
        .subscribe({
          next: () => this.carregarDetalhesEvento(this.eventId!),
          error: (error) => console.error('Erro ao curtir evento:', error),
        });
    }
  }

  dislikeEvento(): void {
    if (this.eventId) {
      this.eventoService
        .interagirEvento(this.eventId, TipoEstatistica.deslike)
        .subscribe({
          next: () => this.carregarDetalhesEvento(this.eventId!),
          error: (error) => console.error('Erro ao não curtir evento:', error),
        });
    }
  }
}
