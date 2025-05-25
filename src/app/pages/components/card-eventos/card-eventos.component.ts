import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';

@Component({
  selector: 'app-card-eventos',
  templateUrl: './card-eventos.component.html',
  styleUrls: ['./card-eventos.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, AngularMaterialModule],
})
export class CardEventosComponent implements OnChanges {
  @Input() categoriaSelecionada: number | null = null;

  eventos: IEventoCard[] = [];
  currentIndex = 0;
  visibleCards = 3;
  cardWidthPercentage = 100 / this.visibleCards;
  isLoading = false;

  constructor(private eventoService: EventoService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoriaSelecionada']) {
      this.listarEventos();
    }
  }

  ngOnInit(): void {
    this.listarEventos(); // Carrega todos inicialmente
  }

  listarEventos() {
    this.isLoading = true;

    this.eventoService.listarEventos(this.categoriaSelecionada).subscribe({
      next: (evento) => {
        this.eventos = evento;
        this.isLoading = false;
      },
      error: (erro) => {
        console.log('Erro ao carregar eventos:', erro.message);
        this.isLoading = false;
      },
    });
  }

  prevSlide(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  nextSlide(): void {
    if (this.currentIndex < this.eventos.length - this.visibleCards)
      this.currentIndex++;
  }

  isPrevDisabled(): boolean {
    return this.currentIndex === 0;
  }

  isNextDisabled(): boolean {
    return this.currentIndex >= this.eventos.length - this.visibleCards;
  }
}
