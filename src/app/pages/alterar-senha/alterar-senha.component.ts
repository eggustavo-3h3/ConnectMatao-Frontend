import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { UsuarioService } from '../../services/usuario.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-alterar-senha',
  imports: [CommonModule, ReactiveFormsModule, AngularMaterialModule],
  templateUrl: './alterar-senha.component.html',
  styleUrls: ['./alterar-senha.component.css'],
})
export class AlterarSenhaComponent implements OnInit {
  alterarSenhaForm!: FormGroup;

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;

  mostrarSenhaAtual: boolean = false;
  mostrarNovaSenha: boolean = false;
  mostrarConfirmarNovaSenha: boolean = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.alterarSenhaForm = this.fb.group(
      {
        senhaAtual: ['', [Validators.required]],
        novaSenha: ['', [Validators.required, Validators.minLength(8)]],
        confirmarNovaSenha: ['', [Validators.required]],
      },
      {
        validators: [this.confirmarSenhasIguais, this.senhaAtualDiferenteNova],
      }
    );
  }

  toggleSenha(field: string): void {
    if (field === 'senhaAtual') {
      this.mostrarSenhaAtual = !this.mostrarSenhaAtual;
    } else if (field === 'novaSenha') {
      this.mostrarNovaSenha = !this.mostrarNovaSenha;
    } else if (field === 'confirmarNovaSenha') {
      this.mostrarConfirmarNovaSenha = !this.mostrarConfirmarNovaSenha;
    }
  }

  confirmarSenhasIguais(group: FormGroup) {
    const nova = group.get('novaSenha')?.value;
    const confirmacao = group.get('confirmarNovaSenha')?.value;
    return nova === confirmacao ? null : { senhasNaoConferem: true };
  }

  senhaAtualDiferenteNova(group: FormGroup) {
    const atual = group.get('senhaAtual')?.value;
    const nova = group.get('novaSenha')?.value;
    return atual && nova && atual === nova
      ? { senhaAtualIgualNova: true }
      : null;
  }

  onSubmit(): void {
    if (this.alterarSenhaForm.valid) {
      this.dialog.open(this.confirmDialog);
    } else {
      this.alterarSenhaForm.markAllAsTouched();
    }
  }

  confirmarAlteracao(): void {
    const { senhaAtual, novaSenha } = this.alterarSenhaForm.value;

    this.usuarioService.alterarSenha(senhaAtual, novaSenha).subscribe({
      next: () => {
        this.snackBar.open('Senha alterada com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.alterarSenhaForm.reset();
        this.dialog.closeAll();
      },
      error: (err) => {
        const response = err?.error;

        if (response?.errors) {
          const errors = response.errors;

          for (const campo in errors) {
            if (campo && this.alterarSenhaForm.get(campo)) {
              this.alterarSenhaForm
                .get(campo)
                ?.setErrors({ apiError: errors[campo][0] });
            } else {
              this.snackBar.open(errors[campo][0], 'Fechar', {
                duration: 4000,
              });
            }
          }
        } else if (typeof response === 'string') {
          this.snackBar.open('Erro: ' + response, 'Fechar', { duration: 4000 });
        } else {
          this.snackBar.open('Erro inesperado ao alterar senha.', 'Fechar', {
            duration: 4000,
          });
        }

        this.dialog.closeAll();
      },
    });
  }

  cancelarAlteracao(): void {
    this.dialog.closeAll();
  }
}
