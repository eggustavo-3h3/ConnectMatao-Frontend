import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-cadastre-se',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    RouterModule,
    NavbarComponent,
  ],
  templateUrl: './cadastre-se.component.html',
  styleUrls: ['./cadastre-se.component.css'],
})
export class CadastreSeComponent implements OnInit {
  registerForm!: FormGroup;
  mostrarSenha = false;
  mostrarConfirmarSenha = false;
  registrationError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmacaoSenha: ['', Validators.required], // corresponde ao campo no JSON
      imagem: [''], // pode ser hidden ou texto vazio
    });
  }

  toggleSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registrationError = 'Preencha todos os campos.';
      return;
    }

    const { nome, email, senha, confirmacaoSenha, imagem } =
      this.registerForm.value;

    if (senha !== confirmacaoSenha) {
      this.registrationError = 'As senhas não coincidem!';
      return;
    }

    this.authService
      .register(nome, email, senha, confirmacaoSenha, imagem)
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          console.error('Erro ao registrar:', err);
          this.registrationError =
            err.error?.mensagem || 'Erro ao registrar. Tente novamente.';
        },
      });
  }
}
