import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { UsuarioService } from '../../../services/usuario.service';
import { DomSanitizer } from '@angular/platform-browser';
import { IEvento } from '../../../interfaces/evento.interface';
import { IUsuario } from '../../../interfaces/usuario.interface';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../nav-bar/nav-bar.component';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';

@Component({
  selector: 'app-card-evento-detalhes',
  templateUrl: './card-evento-detalhes.component.html',
  styleUrls: ['./card-evento-detalhes.component.css'],
  imports: [CommonModule, NavbarComponent, AngularMaterialModule],
})
export class CardEventoDetalhesComponent implements OnInit {
  eventId: string | null = null;
  event: IEvento | null = null;
  usuario: IUsuario | null = null;
  modalOpen = false;
  isLoading = true; // Adicionado o estado de carregamento
  categoriaId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private usuarioService: UsuarioService,
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

  carregarEventos(): void {
    if (this.categoriaId) {
      this.eventoService.listarEventos(this.categoriaId).subscribe({
        next: (eventos) => {
          console.log('Eventos carregados com sucesso:', eventos);
        },
        error: (error) => {
          console.error('Erro ao carregar eventos:', error);
        },
      });
    } else {
      console.log('Categoria não definida');
    }
  }

  carregarDetalhesEvento(eventId: string): void {
    this.isLoading = true; // Marca como carregando
    this.eventoService.getEventoPorId(eventId).subscribe({
      next: (evento) => {
        this.event = evento;
        console.log('Detalhes do evento carregados:', this.event);

        // Agora, buscar os detalhes do usuário
        this.carregarUsuario(evento.usuarioParceiroid);
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do evento:', error);
        this.isLoading = false; // Marca como carregamento finalizado em caso de erro
      },
    });
  }

  carregarUsuario(usuarioParceiroid: string): void {
    this.usuarioService.getUserProfileById(usuarioParceiroid).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        console.log('Detalhes do usuário carregados:', this.usuario);
        this.isLoading = false; // Marca o carregamento como concluído
      },
      error: (error) => {
        console.error('Erro ao carregar detalhes do usuário:', error);
        this.isLoading = false; // Marca como carregamento finalizado em caso de erro
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
        .interagirEvento(this.eventId, 1) // TipoEstatistica.like
        .subscribe({
          next: () => this.carregarDetalhesEvento(this.eventId!),
          error: (error) => console.error('Erro ao curtir evento:', error),
        });
    }
  }

  dislikeEvento(): void {
    if (this.eventId) {
      this.eventoService
        .interagirEvento(this.eventId, 2) // TipoEstatistica.deslike
        .subscribe({
          next: () => this.carregarDetalhesEvento(this.eventId!),
          error: (error) => console.error('Erro ao não curtir evento:', error),
        });
    }
  }
}
