import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { UsuarioService } from '../../../services/usuario.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IEvento } from '../../../interfaces/evento.interface';
import { IUsuario } from '../../../interfaces/usuario.interface';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { TipoEstatistica } from '../../../enums/tipo-estatistica.enum';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ParceiroStatusService } from '../../../services/parceiro-status.service';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-card-evento-detalhes',
  standalone: true,
  templateUrl: './card-evento-detalhes.component.html',
  styleUrls: ['./card-evento-detalhes.component.css'],
  imports: [CommonModule, RouterModule, AngularMaterialModule],
})
export class CardEventoDetalhesComponent implements OnInit {
  idEvento!: string | null;
  evento: IEvento | null = null;
  usuario: IUsuario | null = null;
  modalUsuarioAberto = false;
  carregando = true;
  contagemLikes = 0;
  contagemDislikes = 0;
  usuarioInteragiu = 0;
  urlImagemUsuario: SafeUrl | null = null;
  imagemAtual = 0;
  modalImagemEventoAberto = false;
  modalConfirmacaoAberto = false;
  isCriadorParceiro: boolean = false;

  constructor(
    private rotaAtiva: ActivatedRoute,
    private servicoEvento: EventoService,
    private servicoUsuario: UsuarioService,
    private sanitizador: DomSanitizer,
    private servicoAuth: AuthService,
    private roteador: Router,
    private servicoStatusParceiro: ParceiroStatusService
  ) {}

  ngOnInit(): void {
    this.rotaAtiva.paramMap.subscribe((params) => {
      this.idEvento = params.get('eventId');
      if (this.idEvento) {
        this.carregarDetalhesDoEvento(this.idEvento);
      } else {
        console.error('ID do evento não encontrado');
      }
    });
  }

  get ehAdmin(): boolean {
    return this.servicoAuth.isAdmin();
  }

  podeApagarEvento(): boolean {
    return this.ehAdmin;
  }

  removerEvento(idEvento: string): void {
    if (!idEvento || idEvento.trim() === '') {
      console.error('ID do evento inválido:', idEvento);
      return;
    }
    this.servicoEvento.removerEvento(idEvento).subscribe({
      next: () => {
        console.log('Evento removido com sucesso');
        this.roteador.navigate(['/']);
      },
      error: (erro) => {
        console.error('Erro ao remover evento:', erro);
      },
    });
  }

  carregarDetalhesDoEvento(idEvento: string): void {
    this.carregando = true;
    this.servicoStatusParceiro.clearCache();
    this.servicoEvento.getEventoPorId(idEvento).subscribe({
      next: (evt) => {
        this.evento = evt;
        this.contagemLikes = (evt as any).likes ?? 0;
        this.contagemDislikes = (evt as any).deslikes ?? 0;
        this.usuarioInteragiu = (evt as any).usuarioInteragiu ?? 0;

        this.carregarDadosUsuario(evt.usuarioParceiroid);
        this.servicoStatusParceiro
          .isUserApprovedPartner(evt.usuarioParceiroid)
          .subscribe({
            next: (isParceiro) => {
              this.isCriadorParceiro = isParceiro;
              this.carregando = false;
            },
            error: (erro) => {
              console.error('Erro ao verificar status de parceiro:', erro);
              this.isCriadorParceiro = false;
              this.carregando = false;
            },
          });
      },
      error: (erro) => {
        console.error('Erro ao carregar detalhes do evento:', erro);
        this.carregando = false;
      },
    });
  }

  carregarDadosUsuario(idUsuarioParceiro: string): void {
    this.servicoUsuario.getUserProfileById(idUsuarioParceiro).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.servicoUsuario.getImagemUsuarioPorId(idUsuarioParceiro).subscribe({
          next: (imagemBase64) => {
            this.urlImagemUsuario = imagemBase64
              ? this.sanitizador.bypassSecurityTrustResourceUrl(
                  `data:image/png;base64,${imagemBase64}`
                )
              : this.sanitizador.bypassSecurityTrustResourceUrl(
                  './../../../../../../pngPadrao-NaoLogado.png'
                );
          },
          error: (erro) =>
            console.error('Erro ao buscar imagem do usuário:', erro),
        });
      },
      error: (erro) => console.error('Erro ao carregar usuário:', erro),
    });
  }

  abrirModalImagemDoEvento(): void {
    this.modalImagemEventoAberto = true;
  }

  fecharModalImagemDoEvento(): void {
    this.modalImagemEventoAberto = false;
  }

  abrirModalUsuario(): void {
    this.modalUsuarioAberto = true;
  }

  fecharModalUsuario(): void {
    this.modalUsuarioAberto = false;
  }

  proximaImagem(): void {
    if (!this.evento?.imagens) return;
    this.imagemAtual = (this.imagemAtual + 1) % this.evento.imagens.length;
  }

  imagemAnterior(): void {
    if (!this.evento?.imagens) return;
    this.imagemAtual =
      (this.imagemAtual - 1 + this.evento.imagens.length) %
      this.evento.imagens.length;
  }

  irParaImagem(indice: number): void {
    this.imagemAtual = indice;
  }

  get possuiMultiplasImagens(): boolean {
    return !!this.evento?.imagens && this.evento.imagens.length > 1;
  }

  alternarLike(): void {
    if (!this.idEvento) return;

    let acao$: Observable<void>;
    let novoUsuarioInteragiu: number;

    const oldLikes = this.contagemLikes;
    const oldDislikes = this.contagemDislikes;
    const oldUsuarioInteragiu = this.usuarioInteragiu;

    if (this.usuarioInteragiu === TipoEstatistica.like) {
      this.contagemLikes--;
      novoUsuarioInteragiu = 0;
      acao$ = this.servicoEvento.removerLike(this.idEvento);
    } else if (this.usuarioInteragiu === TipoEstatistica.deslike) {
      this.contagemDislikes--;
      this.contagemLikes++;
      novoUsuarioInteragiu = TipoEstatistica.like;
      acao$ = this.servicoEvento
        .removerDislike(this.idEvento)
        .pipe(
          switchMap(() =>
            this.servicoEvento.interagirEvento(
              this.idEvento!,
              TipoEstatistica.like
            )
          )
        );
    } else {
      this.contagemLikes++;
      novoUsuarioInteragiu = TipoEstatistica.like;
      acao$ = this.servicoEvento.interagirEvento(
        this.idEvento,
        TipoEstatistica.like
      );
    }

    this.usuarioInteragiu = novoUsuarioInteragiu;

    acao$
      .pipe(
        tap(() => {}),
        catchError((erro) => {
          console.error('Erro durante a operação de curtir:', erro);
          this.contagemLikes = oldLikes;
          this.contagemDislikes = oldDislikes;
          this.usuarioInteragiu = oldUsuarioInteragiu;
          return of(undefined);
        })
      )
      .subscribe();
  }

  alternarDislike(): void {
    if (!this.idEvento) return;

    let acao$: Observable<void>;
    let novoUsuarioInteragiu: number;

    const oldLikes = this.contagemLikes;
    const oldDislikes = this.contagemDislikes;
    const oldUsuarioInteragiu = this.usuarioInteragiu;

    if (this.usuarioInteragiu === TipoEstatistica.deslike) {
      this.contagemDislikes--;
      novoUsuarioInteragiu = 0;
      acao$ = this.servicoEvento.removerDislike(this.idEvento);
    } else if (this.usuarioInteragiu === TipoEstatistica.like) {
      this.contagemLikes--;
      this.contagemDislikes++;
      novoUsuarioInteragiu = TipoEstatistica.deslike;
      acao$ = this.servicoEvento
        .removerLike(this.idEvento)
        .pipe(
          switchMap(() =>
            this.servicoEvento.interagirEvento(
              this.idEvento!,
              TipoEstatistica.deslike
            )
          )
        );
    } else {
      this.contagemDislikes++;
      novoUsuarioInteragiu = TipoEstatistica.deslike;
      acao$ = this.servicoEvento.interagirEvento(
        this.idEvento,
        TipoEstatistica.deslike
      );
    }

    this.usuarioInteragiu = novoUsuarioInteragiu;

    acao$
      .pipe(
        tap(() => {}),
        catchError((erro) => {
          console.error('Erro durante a operação de descurtir:', erro);
          this.contagemLikes = oldLikes;
          this.contagemDislikes = oldDislikes;
          this.usuarioInteragiu = oldUsuarioInteragiu;
          return of(undefined);
        })
      )
      .subscribe();
  }

  abrirModalConfirmacao(): void {
    this.modalConfirmacaoAberto = true;
  }

  fecharModalConfirmacao(): void {
    this.modalConfirmacaoAberto = false;
  }

  confirmarRemoverEvento(): void {
    this.fecharModalConfirmacao();
    if (this.idEvento) {
      this.removerEvento(this.idEvento);
    } else {
      console.error('ID do evento não disponível para remover');
    }
  }
}
