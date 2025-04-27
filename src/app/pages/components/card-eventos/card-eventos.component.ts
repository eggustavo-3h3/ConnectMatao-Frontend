import { Component, OnInit } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';

@Component({
  selector: 'app-card-eventos',
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
  categoriaSelecionada: number | null = null; // Nova propriedade para filtrar

  constructor(private eventoService: EventoService) {}

  ngOnInit(): void {
    this.listarEventos();
  }

  // Agora recebe o filtro de categoria como parâmetro
  onFilterChanged(categoryId: number | null) {
    this.categoriaSelecionada = categoryId;
    this.listarEventos(); // Atualiza os eventos com o novo filtro
  }

  listarEventos() {
    this.isLoading = true;

    // Passa o filtro de categoria para o serviço
    this.eventoService.listarEventos(this.categoriaSelecionada).subscribe({
      next: (evento) => {
        this.eventos = evento;
        this.isLoading = false;
      },
      error: (erro) => {
        console.log(erro.message);
        this.isLoading = false;
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
