import { Component, OnInit } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEvento } from '../../../interfaces/evento.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IEventoCard } from '../../../interfaces/evento-card.interface';

@Component({
  selector: 'app-CardEventos',
  templateUrl: './card-eventos.component.html',
  styleUrls: ['./card-eventos.component.css'],
  imports: [CommonModule, RouterModule],
})
export class CardEventosComponent implements OnInit {
  eventos: IEventoCard[] = [];
  currentIndex = 0;
  visibleCards = 3; 
  cardWidthPercentage = 100 / this.visibleCards;

  constructor(private eventoService: EventoService) {}

  ngOnInit(): void {
    this.listarEventos();
  }

  listarEventos() {
    this.eventoService.listarEventos().subscribe({
      next: (evento) => {
        this.eventos = evento;
      },
      error: (erro) => {
        console.log(erro.message);
      },
    });
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
