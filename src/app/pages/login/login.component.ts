import { Component } from '@angular/core';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  mostrarSenha = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
    });
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  onLogin() {
    const { email, senha } = this.loginForm.value;

    this.authService.logar(email, senha).subscribe({
      next: (response) => {
        const { token, role } = response;
        if (token && role) {
          this.authService.saveAuthInfo(token, role);
          this.router.navigate(['/']);
        } else {
          this.snackBar.open(
            'Resposta de login inválida: token ou role ausentes.',
            'Fechar',
            { duration: 3000 }
          );
        }
      },
      error: (erro) => {
        if (erro.status === 400) {
          this.snackBar.open('Usuário ou senha incorretos', 'Fechar', {
            duration: 3000,
          });
          this.loginForm.reset();
          console.clear();
        } else {
          this.snackBar.open('Erro Inesperado ao tentar fazer login', 'Ok', {
            duration: 3000,
          });
          console.clear();
        }
      },
    });
  }
}
