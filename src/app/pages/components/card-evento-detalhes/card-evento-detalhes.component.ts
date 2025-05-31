import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { UsuarioService } from '../../../services/usuario.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IEvento } from '../../../interfaces/evento.interface';
import { IUsuario } from '../../../interfaces/usuario.interface';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../nav-bar/nav-bar.component';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { TipoEstatistica } from '../../../enums/tipo-estatistica.enum';
import { switchMap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-card-evento-detalhes',
  standalone: true,
  templateUrl: './card-evento-detalhes.component.html',
  styleUrls: ['./card-evento-detalhes.component.css'],
  imports: [CommonModule, RouterModule, NavbarComponent, AngularMaterialModule],
})
export class CardEventoDetalhesComponent implements OnInit {
  eventId!: string | null;
  event: IEvento | null = null;
  usuario: IUsuario | null = null;
  modalOpen = false;
  isLoading = true;
  likesCount = 0;
  dislikesCount = 0;
  usuarioInteragiu = 0;
  usuarioImagemUrl: SafeUrl | null = null;
  imagemAtual = 0;
  imagemEventoModalAberta = false;
  confirmarModalAberto = false;

  constructor(
    private route: ActivatedRoute,
    private eventoService: EventoService,
    private usuarioService: UsuarioService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.eventId = params.get('eventId');
      if (this.eventId) {
        this.carregarDetalhesEvento(this.eventId);
      } else {
        console.error('eventId não encontrado');
      }
    });
  }

  // Método para verificar se o usuário atual é administrador
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  //  método para controlar se mostra o botão ou não
  podeApagarEvento(): boolean {
    return this.isAdmin;
  }

  removerEvento(eventoId: string): void {
    if (!eventoId || eventoId.trim() === '') {
      console.error('ID do evento inválido:', eventoId);
      return;
    }
    this.eventoService.removerEvento(eventoId).subscribe({
      next: () => {
        console.log('Evento removido com sucesso');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Erro ao remover evento:', error);
      },
    });
  }

  carregarDetalhesEvento(eventId: string): void {
    this.isLoading = true;
    this.eventoService.getEventoPorId(eventId).subscribe({
      next: (evt) => {
        this.event = evt;
        this.likesCount = (evt as any).likes ?? 0;
        this.dislikesCount = (evt as any).deslikes ?? 0;
        this.usuarioInteragiu = (evt as any).usuarioInteragiu ?? 0;
        this.carregarUsuario(evt.usuarioParceiroid);
        this.isLoading = false;

        console.log('Evento carregado:', evt);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do evento:', err);
        this.isLoading = false;
      },
    });
  }

  carregarUsuario(usuarioParceiroid: string): void {
    this.usuarioService.getUserProfileById(usuarioParceiroid).subscribe({
      next: (user) => {
        this.usuario = user;
        this.usuarioService.getImagemUsuarioPorId(usuarioParceiroid).subscribe({
          next: (imagemBase64) => {
            this.usuarioImagemUrl = imagemBase64
              ? this.sanitizer.bypassSecurityTrustResourceUrl(
                  `data:image/png;base64,${imagemBase64}`
                )
              : this.sanitizer.bypassSecurityTrustResourceUrl(
                  'assets/perfil-placeholder.png'
                );
          },
          error: (err) =>
            console.error('Erro ao buscar imagem do usuário:', err),
        });
      },
      error: (err) => console.error('Erro ao carregar usuário:', err),
    });
  }

  // modal de imagem do evento
  abrirModalImagemEvento(): void {
    this.imagemEventoModalAberta = true;
  }

  fecharModalImagemEvento(): void {
    this.imagemEventoModalAberta = false;
  }

  // modal de imagem do usuario
  openModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  // carousel de imagens do evento

  nextImage(): void {
    if (!this.event?.imagens) return;
    this.imagemAtual = (this.imagemAtual + 1) % this.event.imagens.length;
  }

  prevImage(): void {
    if (!this.event?.imagens) return;
    this.imagemAtual =
      (this.imagemAtual - 1 + this.event.imagens.length) %
      this.event.imagens.length;
  }

  irParaImagem(index: number): void {
    this.imagemAtual = index;
  }
  // -----------------------

  get possuiMultiplasImagens(): boolean {
    return !!this.event?.imagens && this.event.imagens.length > 1;
  }

  toggleLike(): void {
    if (!this.eventId) return;

    if (this.usuarioInteragiu === 1) {
      this.eventoService
        .removerLike(this.eventId)
        .subscribe(() => this.carregarDetalhesEvento(this.eventId!));
    } else {
      const seq$ =
        this.usuarioInteragiu === 2
          ? this.eventoService
              .removerDislike(this.eventId)
              .pipe(
                switchMap(() =>
                  this.eventoService.interagirEvento(
                    this.eventId!,
                    TipoEstatistica.like
                  )
                )
              )
          : this.eventoService.interagirEvento(
              this.eventId,
              TipoEstatistica.like
            );

      seq$.subscribe(() => this.carregarDetalhesEvento(this.eventId!));
    }
  }

  toggleDislike(): void {
    if (!this.eventId) return;

    if (this.usuarioInteragiu === 2) {
      this.eventoService
        .removerDislike(this.eventId)
        .subscribe(() => this.carregarDetalhesEvento(this.eventId!));
    } else {
      const seq$ =
        this.usuarioInteragiu === 1
          ? this.eventoService
              .removerLike(this.eventId)
              .pipe(
                switchMap(() =>
                  this.eventoService.interagirEvento(
                    this.eventId!,
                    TipoEstatistica.deslike
                  )
                )
              )
          : this.eventoService.interagirEvento(
              this.eventId,
              TipoEstatistica.deslike
            );

      seq$.subscribe(() => this.carregarDetalhesEvento(this.eventId!));
    }
  }

  abrirModalConfirmacao(): void {
    this.confirmarModalAberto = true;
  }

  fecharModalConfirmacao(): void {
    this.confirmarModalAberto = false;
  }

  confirmarRemoverEvento(): void {
    this.fecharModalConfirmacao();
    if (this.eventId) {
      this.removerEvento(this.eventId);
    } else {
      console.error('EventoId não disponível para remover');
    }
  }
}
