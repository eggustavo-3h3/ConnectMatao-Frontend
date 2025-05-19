import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-alterar-senha',
  imports: [AngularMaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './alterar-senha.component.html',
  styleUrl: './alterar-senha.component.css',
})
export class AlterarSenhaComponent implements OnInit {
  alterarSenhaForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.alterarSenhaForm = this.fb.group(
      {
        senhaAtual: ['', [Validators.required]],
        novaSenha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarNovaSenha: ['', [Validators.required]],
      },
      {
        validators: this.confirmarSenhasIguais,
      }
    );
  }

  confirmarSenhasIguais(group: FormGroup) {
    const nova = group.get('novaSenha')?.value;
    const confirmacao = group.get('confirmarNovaSenha')?.value;
    return nova === confirmacao ? null : { senhasNaoConferem: true };
  }

  onSubmit(): void {
    if (this.alterarSenhaForm.valid) {
      const { senhaAtual, novaSenha } = this.alterarSenhaForm.value;

      this.usuarioService.alterarSenha(senhaAtual, novaSenha).subscribe({
        next: () => {
          this.snackBar.open('Senha alterada com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.alterarSenhaForm.reset();
        },
        error: (err) => {
          this.snackBar.open('Erro ao alterar senha: ' + err.error, 'Fechar', {
            duration: 4000,
          });
        },
      });
    }
  }
}
