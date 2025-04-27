import { Component, OnInit } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEvento } from '../../../interfaces/evento.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';

@Component({
  selector: 'app-CardEventos',
  templateUrl: './card-eventos.component.html',
  styleUrls: ['./card-eventos.component.css'],
  imports: [CommonModule, RouterModule, AngularMaterialModule],
})
export class CardEventosComponent implements OnInit {
  eventos: IEventoCard[] = [];
  currentIndex = 0;
  visibleCards = 3;
  cardWidthPercentage = 100 / this.visibleCards;
  isLoading = true;

  constructor(private eventoService: EventoService) {}

  ngOnInit(): void {
    this.listarEventos();
  }

  listarEventos() {
    this.isLoading = true; // mostra o spinner

    this.eventoService.listarEventos().subscribe({
      next: (evento) => {
        this.eventos = evento;
        this.isLoading = false; // esconde o spinner
      },
      error: (erro) => {
        console.log(erro.message);
        this.isLoading = false; // esconde o spinner mesmo com erro
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
