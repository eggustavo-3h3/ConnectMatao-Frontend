import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
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
    this.chaveResetSenha = this.route.snapshot.paramMap.get('chave-reset') ?? '';
    alert(this.chaveResetSenha);

    this.resetarSenhaForm = this.fb.group(
      {
        novaSenha: ['', Validators.required],
        confirmarNovaSenha: ['', Validators.required],
      },

      { validators: this.senhasIguais }
    );
  }

  senhasIguais(group: AbstractControl) {
    const novaSenha = group.get('novaSenha')?.value;
    const confirmarNovaSenha = group.get('confirmarNovaSenha')?.value;
    return novaSenha === confirmarNovaSenha ? null : { passwordMismatch: true };
  }

  resetarSenha(): void {
    if (this.resetarSenhaForm.invalid) {
      this.resetarSenhaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const dadosResetSenha = this.resetarSenhaForm.getRawValue();
    dadosResetSenha.chaveResetSenha = this.chaveResetSenha;

    this.usuarioService
      .resetarSenhaComChave(dadosResetSenha)
      .subscribe({
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
              : 'Erro ao redefinir senha.';
          this.snackBar.open(msg, 'Fechar', { duration: 4000 });
        },
      });
  }
}
