import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
  filter,
  tap,
} from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EventoService } from '../../../services/evento.service';
import { FormUsuarioParceiroService } from '../../../services/form-usuario-parceiro.service';
import { IUsuario } from '../../../interfaces/usuario.interface';
import { IEvento } from '../../../interfaces/evento.interface';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormParceiroModalComponent } from '../form-parceiro-modal/form-parceiro-modal.component';
import { Perfil } from '../../../enums/perfil.enum';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-navbar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  estaLogado = false;
  dropdownVisivel = false;
  resultadosPesquisa: IEvento[] = [];
  pesquisaFocada = false;
  urlImagemUsuario: string = 'assets/default-user.png';
  nomeUsuario: string = '';
  usuario: IUsuario | null = null;
  menuAberto = false;
  navbarVisivel = true;
  ultimoScrollTop = 0;

  ehPapelParceiro: boolean = false;
  parceiroAprovado: boolean = false;
  formularioParceiroExiste: boolean = false;
  statusParceiroCarregado: boolean = false;

  private referenciaModal: MatDialogRef<FormParceiroModalComponent> | null =
    null;

  @ViewChild('campoPesquisa') campoPesquisa!: ElementRef;

  private inscricaoAuth?: Subscription;
  private termosPesquisa = new Subject<string>();
  private inscricaoStatusParceiro?: Subscription;

  constructor(
    public servicoAuth: AuthService,
    private servicoUsuario: UsuarioService,
    private servicoEvento: EventoService,
    private servicoFormParceiro: FormUsuarioParceiroService,
    private roteador: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inscricaoAuth = this.servicoAuth.isLoggedIn$
      .pipe(distinctUntilChanged())
      .subscribe((logado) => {
        this.estaLogado = logado;
        if (logado) {
          this.carregarPerfilUsuario();
          setTimeout(() => {
            this.verificarStatusAprovacaoParceiro(true);
          }, 50);
        } else {
          this.urlImagemUsuario = 'assets/pngPadrao-NaoLogado.png';
          this.nomeUsuario = '';
          this.ehPapelParceiro = false;
          this.parceiroAprovado = false;
          this.formularioParceiroExiste = false;
          this.statusParceiroCarregado = true;
          this.fecharModalParceiro();
        }
        window.addEventListener('scroll', this.aoScroll.bind(this));
      });

    if (this.servicoAuth.isAuthenticated()) {
      this.estaLogado = true;
      this.carregarPerfilUsuario();
      setTimeout(() => {
        this.verificarStatusAprovacaoParceiro(true);
      }, 50);
    } else {
      this.statusParceiroCarregado = true;
    }

    this.termosPesquisa
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) => {
          if (termo.length === 0) {
            return this.servicoEvento.listarEventosMaisCurtidos(5).pipe(
              tap((eventos) => {
                this.resultadosPesquisa = eventos;
              })
            );
          } else {
            return this.servicoEvento.searchEvents(termo).pipe(
              tap((eventos) => {
                this.resultadosPesquisa = eventos;
              })
            );
          }
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Erro na pesquisa de eventos', err);
          this.resultadosPesquisa = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.inscricaoAuth?.unsubscribe();
    this.inscricaoStatusParceiro?.unsubscribe();
    window.removeEventListener('scroll', this.aoScroll.bind(this));
    this.fecharModalParceiro();
  }

  private carregarPerfilUsuario(): void {
    if (!this.servicoAuth.isAuthenticated()) {
      this.urlImagemUsuario = 'assets/pngPadrao-NaoLogado.png';
      this.nomeUsuario = '';
      return;
    }

    const userId = this.servicoAuth.getUserId();
    if (!userId) {
      this.urlImagemUsuario = 'assets/pngPadrao-NaoLogado.png';
      this.nomeUsuario = '';
      return;
    }

    this.servicoUsuario
      .getPerfilUsuario()
      .pipe(take(1))
      .subscribe({
        next: (user) => {
          this.urlImagemUsuario =
            user.imagem && user.imagem.length > 0
              ? `data:image/jpeg;base64,${user.imagem}`
              : './assets/pngPadrao-NaoLogado.png';
          this.nomeUsuario = user.nome;
        },
        error: (err) => {
          console.error('Erro ao carregar perfil:', err);
          this.urlImagemUsuario = './assets/pngPadrao-NaoLogado.png';
          this.nomeUsuario = '';
        },
      });
  }

  private verificarStatusAprovacaoParceiro(
    deveAbrirModal: boolean = false
  ): void {
    const papelUsuario = this.servicoAuth.getRole();
    this.ehPapelParceiro =
      papelUsuario?.trim().toLowerCase() === Perfil.Parceiro.toLowerCase();
    this.statusParceiroCarregado = false;

    if (this.ehPapelParceiro) {
      this.inscricaoStatusParceiro?.unsubscribe();
      this.inscricaoStatusParceiro = this.servicoFormParceiro
        .getLoggedUserPartnerStatus()
        .subscribe({
          next: (status) => {
            this.parceiroAprovado = status.flagAprovadoParceiro ?? false;
            this.formularioParceiroExiste = status.formParceiroExiste ?? false;
            this.statusParceiroCarregado = true;

            if (
              deveAbrirModal &&
              !this.parceiroAprovado &&
              !this.formularioParceiroExiste
            ) {
              this.abrirModalFormularioParceiroControlado();
            } else {
              this.fecharModalParceiro();
            }
          },
          error: (err) => {
            console.error(
              'Erro ao verificar status de aprovação do parceiro na Navbar:',
              err
            );
            this.parceiroAprovado = false;
            this.formularioParceiroExiste = false;
            this.statusParceiroCarregado = true;
            this.fecharModalParceiro();
          },
        });
    } else {
      this.parceiroAprovado = false;
      this.formularioParceiroExiste = false;
      this.statusParceiroCarregado = true;
      this.fecharModalParceiro();
    }
  }

  abrirModalFormularioParceiroControlado(): void {
    if (this.formularioParceiroExiste && !this.parceiroAprovado) {
      return;
    }

    if (this.referenciaModal) {
      return;
    }

    if (this.dialog.openDialogs.length > 0) {
      this.dialog.closeAll();
      setTimeout(() => this.abrirModalFormularioParceiroControlado(), 50);
      return;
    }

    this.referenciaModal = this.dialog.open(FormParceiroModalComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
    });

    this.referenciaModal.afterClosed().subscribe(() => {
      this.referenciaModal = null;
      setTimeout(() => {
        this.verificarStatusAprovacaoParceiro(false);
      }, 100);
    });
  }

  fecharModalParceiro(): void {
    if (this.referenciaModal) {
      this.referenciaModal.close();
      this.referenciaModal = null;
    } else if (this.dialog.openDialogs.length > 0) {
      this.dialog.closeAll();
    }
  }

  abrirFormularioParceiroPeloCliqueNaNavbar(): void {
    if (!this.parceiroAprovado && !this.formularioParceiroExiste) {
      this.abrirModalFormularioParceiroControlado();
    } else {
      if (this.formularioParceiroExiste && !this.parceiroAprovado) {
        this.snackBar.open(
          'Seu cadastro de parceiro já foi enviado e está em análise.',
          'Fechar',
          {
            duration: 5000,
            panelClass: ['snackbar-info'],
          }
        );
      } else if (this.parceiroAprovado) {
        this.snackBar.open('Você já é um parceiro aprovado!', 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-success'],
        });
      }
    }
  }

  aoScroll(): void {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > this.ultimoScrollTop && currentScrollTop > 200) {
      this.navbarVisivel = false;
    } else {
      this.navbarVisivel = true;
    }

    this.ultimoScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }

  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  alternarDropdown(): void {
    this.dropdownVisivel = !this.dropdownVisivel;
  }

  sair(): void {
    this.servicoAuth.logout();
    this.roteador.navigate(['/login']);
    this.dropdownVisivel = false;
    this.estaLogado = false;
    this.urlImagemUsuario = 'assets/pngPadrao-NaoLogado.png';
    this.nomeUsuario = '';
    this.fecharModalParceiro();
  }

  irParaPerfil(): void {
    const userId = this.servicoAuth.getUserId();
    if (userId) {
      this.roteador.navigate([`/perfil/${userId}`]);
    } else {
      this.snackBar.open(
        'Não foi possível encontrar o perfil do usuário.',
        'Fechar',
        { duration: 3000 }
      );
    }
    this.dropdownVisivel = false;
  }

  aoFocarPesquisa(): void {
    this.pesquisaFocada = true;
    this.pesquisar(this.campoPesquisa.nativeElement.value);
  }

  aoDesfocarPesquisa(): void {
    setTimeout(() => {
      this.pesquisaFocada = false;
      this.resultadosPesquisa = [];
    }, 200);
  }

  irParaDetalhesEvento(idEvento: number | string | undefined): void {
    if (idEvento) {
      this.roteador.navigate(['/detalhe-evento', idEvento.toString()]);
      this.resultadosPesquisa = [];
      this.campoPesquisa.nativeElement.value = '';
      this.pesquisaFocada = false;
    }
  }

  pesquisar(termo: string): void {
    this.termosPesquisa.next(termo);
  }
}
