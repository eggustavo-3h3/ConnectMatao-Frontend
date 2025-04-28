import { Component, HostListener, OnInit } from '@angular/core';
import { EventoService } from '../../../services/evento.service';
import { IEventoCard } from '../../../interfaces/evento-card.interface';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-feed-eventos',
  templateUrl: './feed-eventos.component.html',
  styleUrls: ['./feed-eventos.component.css'],
  imports: [AngularMaterialModule, CommonModule, RouterModule],
})
export class FeedEventosComponent implements OnInit {
  eventos: IEventoCard[] = [];
  isLoading = false;
  categoriaSelecionada: number | null = null;

  private page = 0;
  private readonly limit = 3;
  private allLoaded = false;

  constructor(private eventoService: EventoService) {}

  ngOnInit(): void {
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

    this.eventoService.listarEventos(this.categoriaSelecionada).subscribe({
      next: (todosEventos) => {
        const novosEventos = todosEventos.slice(
          this.page * this.limit,
          (this.page + 1) * this.limit
        );
        if (novosEventos.length > 0) {
          this.eventos = [...this.eventos, ...novosEventos];
          this.page++;
        } else {
          this.allLoaded = true;
        }
        this.isLoading = false;
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
