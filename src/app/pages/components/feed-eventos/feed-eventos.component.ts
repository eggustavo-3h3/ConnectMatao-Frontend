import {
  Component,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
export class FeedEventosComponent implements OnChanges {
  eventos: IEventoCard[] = [];
  isLoading = false;

  @Input() categoriaSelecionada: number | null = null;

  private page = 0;
  private readonly limit = 3;
  private allLoaded = false;

  constructor(private eventoService: EventoService) {}

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
