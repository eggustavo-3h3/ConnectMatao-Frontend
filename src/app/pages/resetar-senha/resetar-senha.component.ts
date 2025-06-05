import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';

@Component({
  standalone: true,
  selector: 'app-resetar-senha',
  templateUrl: './resetar-senha.component.html',
  styleUrls: ['./resetar-senha.component.css'],
  imports: [CommonModule, ReactiveFormsModule, AngularMaterialModule],
})
export class ResetarSenhaComponent implements OnInit {
  resetarSenhaForm!: FormGroup;
  loading = false;
  chaveResetSenha: string = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.chaveResetSenha =
      this.route.snapshot.paramMap.get('chave-reset') ?? '';

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;

    this.resetarSenhaForm = this.fb.group(
      {
        novaSenha: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(passwordPattern),
          ],
        ],
        confirmarNovaSenha: ['', [Validators.required]],
      },
      { validators: this.senhasIguais }
    );
  }

  // Validador personalizado para verificar se as senhas são iguais
  senhasIguais(group: AbstractControl): ValidationErrors | null {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmarNovaSenha = group.get('confirmarNovaSenha')?.value;

    // Retorna null se as senhas forem iguais, ou um erro 'passwordMismatch' se forem diferentes
    return novaSenha === confirmarNovaSenha ? null : { passwordMismatch: true };
  }

  resetarSenha(): void {
    // Se o formulário for inválido, marca todos os campos como "tocados" para exibir os erros
    if (this.resetarSenhaForm.invalid) {
      this.resetarSenhaForm.markAllAsTouched();
      return;
    }

    this.loading = true; // Ativa o estado de carregamento

    // Obtém os dados do formulário, incluindo a chave de reset da senha
    const dadosResetSenha = this.resetarSenhaForm.getRawValue();
    dadosResetSenha.chaveResetSenha = this.chaveResetSenha;

    // Chama o serviço para redefinir a senha
    this.usuarioService.resetarSenhaComChave(dadosResetSenha).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Senha redefinida com sucesso!', 'Fechar', {
          duration: 4000,
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        const msg =
          typeof err?.error === 'string'
            ? err.error
            : 'Erro ao redefinir senha. Verifique a chave de recuperação ou tente novamente.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
