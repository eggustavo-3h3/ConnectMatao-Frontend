// src/app/pages/cadastre-se/cadastre-se.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';
import { LoginComponent } from '../login/login.component';
import { Perfil } from '../../enums/perfil.enum'; // Importa o enum Perfil
import { IUsuario } from '../../interfaces/usuario.interface'; // Importa a interface IUsuario

@Component({
  selector: 'app-cadastre-se',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule,
    NavbarComponent,
    LoginComponent,
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
    // Popula perfisDisponiveis, EXCLUINDO 'Administrador'
    this.perfisDisponiveis = Object.values(Perfil).filter(
      (perfil) => perfil !== Perfil.Administrador
    );

    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmacaoSenha: ['', Validators.required],
      imagem: [''],
      perfil: [Perfil.Usuario, Validators.required], // Valor padrão como string 'Usuario'
    });
  }

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  onRegister(): void {
    // Limpa a mensagem de erro anterior
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

          // Lógica aprimorada para exibir a mensagem de erro do backend
          if (err.status === 400) {
            if (err.error?.mensagem) {
              // Se o erro for um objeto com a propriedade 'mensagem' (ex: e-mail duplicado)
              this.registrationError = err.error.mensagem;
            } else if (Array.isArray(err.error)) {
              // Se o erro for um array de strings (erros do FluentValidation)
              this.registrationError = `Erro de validação: ${err.error.join(
                ', '
              )}`;
            } else {
              // Para qualquer outro formato de erro 400
              this.registrationError =
                'Erro de requisição. Verifique os dados e tente novamente.';
            }
          } else {
            // Para outros status de erro (500, etc.)
            this.registrationError =
              'Ocorreu um erro inesperado. Tente novamente mais tarde.';
          }
        },
      });
  }
}
