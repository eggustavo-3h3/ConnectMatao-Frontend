// src/app/pages/home/home.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';
import { CardEventosComponent } from '../components/card-eventos/card-eventos.component';
import { FiltroEventosComponent } from '../components/filtro-eventos/filtro-eventos.component';
import { FeedEventosComponent } from '../components/feed-eventos/feed-eventos.component';
import { AuthService } from '../../services/auth.service';
import { FormUsuarioParceiroService } from '../../services/form-usuario-parceiro.service';
import { MatDialog } from '@angular/material/dialog';
import { FormParceiroModalComponent } from '../components/form-parceiro-modal/form-parceiro-modal.component';
import { Perfil } from '../../enums/perfil.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    CardEventosComponent,
    FiltroEventosComponent,
    FeedEventosComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent implements OnInit, OnDestroy {
  categoriaSelecionada: number | null = null;

  isPartnerRole: boolean = false;
  isPartnerApproved: boolean = false;
  formParceiroExists: boolean = false; // Novo estado para controlar se o formulário já foi enviado

  private authSubscription!: Subscription;
  private dialogSubscription!: Subscription;

  private authService = inject(AuthService);
  private formParceiroService = inject(FormUsuarioParceiroService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (isLoggedIn) => {
        if (isLoggedIn) {
          // Pequeno atraso para garantir que o estado de login esteja totalmente resolvido
          setTimeout(() => {
            this.checkPartnerApprovalStatusAndMaybeOpenModal();
          }, 50);
        } else {
          this.dialog.closeAll();
          this.isPartnerRole = false;
          this.isPartnerApproved = false;
          this.formParceiroExists = false; // Resetar
        }
      }
    );

    if (this.authService.isAuthenticated()) {
      setTimeout(() => {
        this.checkPartnerApprovalStatusAndMaybeOpenModal();
      }, 50);
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
    this.dialog.closeAll(); // Garantir que todos os modais sejam fechados ao destruir o componente
  }

  checkPartnerApprovalStatusAndMaybeOpenModal(): void {
    const userRole = this.authService.getRole();
    this.isPartnerRole =
      userRole?.trim().toLowerCase() === Perfil.Parceiro.toLowerCase();

    if (this.isPartnerRole) {
      this.formParceiroService.getLoggedUserPartnerStatus().subscribe({
        next: (status) => {
          this.isPartnerApproved = status.flagAprovadoParceiro ?? false;
          this.formParceiroExists = status.formParceiroExiste ?? false; // Atualiza o novo estado

          console.log('HomeComponent - Partner Status:', status);
          console.log(
            'HomeComponent - isPartnerApproved:',
            this.isPartnerApproved
          );
          console.log(
            'HomeComponent - formParceiroExists:',
            this.formParceiroExists
          );

          // Lógica crucial:
          // Abre o modal SE:
          // 1. É um parceiro
          // 2. NÃO está aprovado
          // 3. O FORMULÁRIO AINDA NÃO EXISTE (não foi enviado)
          // 4. Nenhum modal já está aberto
          if (
            this.isPartnerRole &&
            !this.isPartnerApproved &&
            !this.formParceiroExists && // Condição adicionada/ajustada
            this.dialog.openDialogs.length === 0
          ) {
            this.openPartnerFormModal();
          } else {
            // Se o parceiro está aprovado, OU o formulário já existe (está em análise),
            // OU não é um parceiro, garantir que o modal esteja fechado.
            this.dialog.closeAll();
          }
        },
        error: (err) => {
          console.error(
            'Erro ao verificar status de aprovação do parceiro na Home:',
            err
          );
          this.isPartnerApproved = false;
          this.formParceiroExists = false;
          this.dialog.closeAll(); // Fechar o modal em caso de erro na checagem
        },
      });
    } else {
      this.isPartnerRole = false;
      this.isPartnerApproved = false;
      this.formParceiroExists = false;
      this.dialog.closeAll();
    }
  }

  openPartnerFormModal(): void {
    if (this.dialog.openDialogs.length > 0) {
      return;
    }

    const dialogRef = this.dialog.open(FormParceiroModalComponent, {
      width: '500px',
      disableClose: true, // Manter disableClose: true para forçar o preenchimento ou logout
    });

    this.dialogSubscription = dialogRef.afterClosed().subscribe(() => {
      // Re-verifique o status após o modal ser fechado (por submissão ou logout)
      // Um pequeno atraso pode ajudar a evitar corrida de condições
      setTimeout(() => {
        this.checkPartnerApprovalStatusAndMaybeOpenModal();
      }, 100);
    });
  }

  onCategoriaChange(categoriaId: number | null) {
    this.categoriaSelecionada = categoriaId;
  }

  get mostrarCarrossel(): boolean {
    return (
      this.categoriaSelecionada === null ||
      this.categoriaSelecionada === undefined
    );
  }
}
