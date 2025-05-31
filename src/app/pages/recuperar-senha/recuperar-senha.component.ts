import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';

@Component({
  standalone: true,
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.component.html',
  styleUrls: ['./recuperar-senha.component.css'],
  imports: [CommonModule, ReactiveFormsModule, AngularMaterialModule],
})
export class RecuperarSenhaComponent implements OnInit {
  recuperarSenhaForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recuperarSenhaForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  enviarEmail(): void {
    if (this.recuperarSenhaForm.invalid) {
      this.recuperarSenhaForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const email = this.recuperarSenhaForm.value.email;

    this.usuarioService.solicitarRecuperacaoSenha(email).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(
          'Email enviado com sucesso! Verifique sua caixa de entrada.',
          'Fechar',
          { duration: 4000 }
        );
        this.router.navigate(['/login']); // Ou para outra rota que preferir
      },
      error: (err) => {
        this.loading = false;
        const msg =
          typeof err?.error === 'string'
            ? err.error
            : 'Erro ao enviar email de recuperação.';
        this.snackBar.open(msg, 'Fechar', { duration: 4000 });
      },
    });
  }
}
