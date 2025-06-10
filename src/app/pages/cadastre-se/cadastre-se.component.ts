import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Perfil } from '../../enums/perfil.enum';

@Component({
  selector: 'app-cadastre-se',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule
  ],
  templateUrl: './cadastre-se.component.html',
  styleUrls: ['./cadastre-se.component.css'],
})
export class CadastreSeComponent implements OnInit {
  registerForm!: FormGroup;
  mostrarSenha = false;
  mostrarConfirmarSenha = false;
  registrationError: string = '';

  perfisDisponiveis: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.perfisDisponiveis = Object.values(Perfil).filter(
      (perfil) => perfil !== Perfil.Administrador
    );

    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmacaoSenha: ['', Validators.required],
      imagem: [''],
      perfil: [Perfil.Usuario, Validators.required],
    });
  }

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  onRegister(): void {
    this.registrationError = '';

    if (this.registerForm.invalid) {
      this.registrationError =
        'Por favor, preencha todos os campos obrigatórios corretamente.';
      return;
    }

    const { nome, email, senha, confirmacaoSenha, imagem } =
      this.registerForm.value;
    const perfilString: Perfil = this.registerForm.value.perfil;

    if (senha !== confirmacaoSenha) {
      this.registrationError = 'As senhas não coincidem!';
      return;
    }

    const convertPerfilToNumeric = (perfil: Perfil): number => {
      switch (perfil) {
        case Perfil.Usuario:
          return 1; // API espera 1 para 'Usuario'
        case Perfil.Parceiro:
          return 2; // API espera 2 para 'Parceiro'
        default:
          console.error(
            `Tentativa de registrar com perfil desconhecido/não permitido: ${perfil}`
          );
          throw new Error('Perfil selecionado inválido para cadastro.');
      }
    };

    const perfilNumerico: number = convertPerfilToNumeric(perfilString);

    this.authService
      .register(nome, email, senha, confirmacaoSenha, imagem, perfilNumerico)
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          console.error('Erro ao registrar:', err);

          if (err.status === 400) {
            if (err.error?.mensagem) {
              this.registrationError = err.error.mensagem;
            } else if (Array.isArray(err.error)) {
              this.registrationError = `Erro de validação: ${err.error.join(
                ', '
              )}`;
            } else {
              this.registrationError =
                'Erro de requisição. Verifique os dados e tente novamente.';
            }
          } else {
            this.registrationError =
              'Ocorreu um erro inesperado. Tente novamente mais tarde.';
          }
        },
      });
  }
}
