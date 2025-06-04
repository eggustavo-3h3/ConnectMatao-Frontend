import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialog,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';

import { NgxMaskPipe } from 'ngx-mask';
import { FormUsuarioParceiroService } from '../../../services/form-usuario-parceiro.service';
import { IParceiro } from '../../../interfaces/parceiro.interface';

@Component({
  selector: 'app-solicitacoes-parceiros',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    NgxMaskPipe,
  ],
  templateUrl: './solicitacoes-parceiros.component.html',
  styleUrls: ['./solicitacoes-parceiros.component.css'],
})
export class SolicitacoesParceirosComponent implements OnInit {
  // Propriedades
  solicitacoesPendentes: IParceiro[] = [];
  carregando: boolean = true;
  erro: string | null = null;

  // Para o modal de confirmação genérico
  @ViewChild('modalConfirmacao') modalConfirmacao!: TemplateRef<any>;
  referenciaModalAtual!: MatDialogRef<any>;
  dadosModal: {
    titulo: string;
    mensagem: string;
    textoConfirmar: string;
    textoCancelar: string;
    acaoConfirmada: (id: string) => void;
    id: string;
  } | null = null;

  constructor(
    private servicoFormUsuarioParceiro: FormUsuarioParceiroService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarSolicitacoesPendentes();
  }

  // Métodos
  carregarSolicitacoesPendentes(): void {
    this.carregando = true;
    this.erro = null;
    this.servicoFormUsuarioParceiro.getPendingPartnerApplications().subscribe({
      next: (data) => {
        this.solicitacoesPendentes = data;
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar solicitações pendentes:', err);
        this.erro =
          'Não foi possível carregar as solicitações. Tente novamente mais tarde.';
        this.carregando = false;
        this.snackBar.open(this.erro, 'Fechar', {
          duration: 5000,
          panelClass: ['snackbar-error'],
        });
      },
    });
  }

  /**
   * Abre um modal de confirmação genérico usando um template local.
   * @param titulo O título do modal.
   * @param mensagem A mensagem exibida no modal.
   * @param textoConfirmar O texto do botão de confirmar.
   * @param textoCancelar O texto do botão de cancelar.
   * @param acaoConfirmada A função a ser executada se confirmado.
   * @param id O ID da aplicação sendo processada.
   */
  abrirModalConfirmacao(
    titulo: string,
    mensagem: string,
    textoConfirmar: string,
    textoCancelar: string,
    acaoConfirmada: (id: string) => void,
    id: string
  ): void {
    this.dadosModal = {
      titulo,
      mensagem,
      textoConfirmar,
      textoCancelar,
      acaoConfirmada,
      id,
    };
    this.referenciaModalAtual = this.dialog.open(this.modalConfirmacao, {
      width: '400px',
      disableClose: true, // O usuário deve escolher uma opção
    });

    this.referenciaModalAtual.afterClosed().subscribe((resultado: boolean) => {
      if (resultado && this.dadosModal) {
        // Se confirmado e os dados do modal existirem
        this.dadosModal.acaoConfirmada(this.dadosModal.id);
      }
      this.dadosModal = null; // Limpa os dados do modal
    });
  }

  aprovarSolicitacao(id: string): void {
    this.abrirModalConfirmacao(
      'Confirmar Aprovação',
      'Tem certeza de que deseja **aprovar** esta solicitação de parceiro? Esta ação concederá ao usuário acesso para divulgar eventos.',
      'Aprovar',
      'Cancelar',
      this._aprovarSolicitacao, // Passa o método privado
      id
    );
  }

  // Método privado para encapsular a lógica de aprovação
  private _aprovarSolicitacao = (id: string): void => {
    this.servicoFormUsuarioParceiro.approvePartner(id).subscribe({
      next: () => {
        this.snackBar.open('Solicitação aprovada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.carregarSolicitacoesPendentes(); // Recarrega a lista
      },
      error: (err) => {
        console.error('Erro ao aprovar solicitação:', err);
        this.snackBar.open(
          'Erro ao aprovar solicitação. Tente novamente.',
          'Fechar',
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      },
    });
  };

  rejeitarSolicitacao(id: string): void {
    this.abrirModalConfirmacao(
      'Confirmar Reprovação',
      'Tem certeza de que deseja **reprovar** esta solicitação? Esta ação é irreversível e removerá a solicitação da lista.',
      'Reprovar',
      'Cancelar',
      this._rejeitarSolicitacao, // Passa o método privado
      id
    );
  }

  // Método privado para encapsular a lógica de reprovação
  private _rejeitarSolicitacao = (id: string): void => {
    this.servicoFormUsuarioParceiro.rejectPartner(id).subscribe({
      next: () => {
        this.snackBar.open('Solicitação reprovada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['snackbar-info'],
        });
        this.carregarSolicitacoesPendentes(); // Recarrega a lista
      },
      error: (err) => {
        console.error('Erro ao reprovar solicitação:', err);
        this.snackBar.open(
          'Erro ao reprovar solicitação. Tente novamente.',
          'Fechar',
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      },
    });
  };
}
