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
    BrowserModule,
    CommonModule, // Add CommonModule here
  ],
})
export class CardEventoDetalhesComponent implements OnInit {
  eventId: string | null = null; // Event ID from URL params
  event: IEvento | null = null; // To store the selected event details
  usuario: IEventoCard | null = null;
  modalOpen = false; // To control modal visibility
  categoriaId: number | null = null; // Category ID if applicable

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Extract eventId from URL route parameters
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('eventId'); // Assuming eventId is part of the URL
      if (this.eventId) {
        this.carregarDetalhesEvento(this.eventId);
      }
    });

    // Optionally, you can load other events if needed based on a categoryId
    if (this.categoriaId) {
      this.carregarEventos();
    }
  }

  // Fetch details of a specific event
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

  // Fetch list of events (if needed based on categoriaId)
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

  // Open modal for event image
  openModal(): void {
    this.modalOpen = true;
  }

  // Close modal for event image
  closeModal(): void {
    this.modalOpen = false;
  }

  // Like event
  likeEvento(): void {
    if (this.eventId) {
      this.eventoService
        .interagirEvento(this.eventId, TipoEstatistica.like)
        .subscribe({
          next: () => this.carregarDetalhesEvento(this.eventId!), // Reload event to update like/dislike count
          error: (error) => console.error('Erro ao curtir evento:', error),
        });
    }
  }

  // Dislike event
  dislikeEvento(): void {
    if (this.eventId) {
      this.eventoService
        .interagirEvento(this.eventId, TipoEstatistica.deslike)
        .subscribe({
          next: () => this.carregarDetalhesEvento(this.eventId!), // Reload event to update like/dislike count
          error: (error) => console.error('Erro ao não curtir evento:', error),
        });
    }
  }
}
