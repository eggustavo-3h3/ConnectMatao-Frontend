import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EventoService } from '../../../services/evento.service';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../../../angular_material/angular-material/angular-material.module';
import { NavbarComponent } from '../nav-bar/nav-bar.component';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
registerLocaleData(localePt);

@Component({
  selector: 'app-divulgar-evento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    NavbarComponent,
  ],
  templateUrl: './divulgar-evento.component.html',
  styleUrls: ['./divulgar-evento.component.css'],
})
export class DivulgarEventoComponent implements OnInit {
  eventoForm: FormGroup;
  categorias: any[] = [];
  imagemPreview: string | null = null;
  usuario: any = null;
  minDate: Date;
  selectedFiles: File[] = [];
  selectedDate: any = null;
  isProcessing = false; // Controle de envio do evento

  constructor(
    private readonly fb: FormBuilder,
    private readonly eventoService: EventoService,
    private readonly categoriaService: CategoriaService,
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.minDate = new Date();
    this.eventoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.required],
      cep: ['', [Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: ['', Validators.required],
      telefone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/), // (XX) XXXXX-XXXX
        ],
      ],
      whatsapp: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/), // (XX) XXXXX-XXXX
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      data: ['', Validators.required],
      horario: [
        '',
        [
          Validators.required,
          Validators.pattern(/^([0-1]\d|2[0-3]):([0-5]\d)$/),
        ],
      ],
      faixaEtaria: [0, [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      imagem: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isPartner() && !this.authService.isAdmin()) {
      this.snackBar.open(
        'Apenas usuários parceiros ou administradores podem divulgar eventos.',
        'Fechar',
        { duration: 5000 }
      );
      this.router.navigate(['/']);
      return;
    }

    this.carregarCategorias();
    this.carregarUsuario();
  }

  formatPhone(event: any, field: string) {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');

    if (field === 'telefone' || field === 'whatsapp') {
      if (value.length > 11) {
        value = value.substring(0, 11);
      }

      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
    }

    input.value = value;
    this.eventoForm.get(field)?.setValue(value, { emitEvent: false });
  }

  carregarUsuario(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.snackBar.open('Sessão expirada, faça login novamente', 'Fechar', {
        duration: 3000,
      });
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.getUser(userId).subscribe({
      next: (user) => {
        this.usuario = user;
      },
      error: (err) => {
        console.error('Erro ao carregar usuário:', err);
        this.snackBar.open(
          'Erro ao carregar informações do usuário',
          'Fechar',
          { duration: 3000 }
        );

        if (err.status === 404) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  carregarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        console.log(categorias);
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.snackBar.open('Erro ao carregar categorias', 'Fechar', {
          duration: 3000,
        });
      },
    });
  }

  onFileChange(event: Event): void {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length > 0) {
      this.selectedFiles = Array.from(target.files);

      // Se quiser mostrar a prévia da primeira imagem:
      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFiles[0]);
    }
  }

  onSubmit(): void {
    if (this.eventoForm.invalid || this.isProcessing) return;

    this.isProcessing = true;
    const formData = new FormData();

    const formValues = this.eventoForm.value;

    formData.append('titulo', formValues.titulo);
    formData.append('descricao', formValues.descricao);
    formData.append('cep', formValues.cep);
    formData.append('logradouro', formValues.logradouro);
    formData.append('numero', formValues.numero);
    formData.append('bairro', formValues.bairro);
    formData.append('telefone', formValues.telefone);
    formData.append('whatsapp', formValues.whatsapp);
    formData.append('email', formValues.email);
    formData.append('data', formValues.data.toISOString());
    formData.append('categoriaid', formValues.categoria);
    formData.append('flagAprovado', 'false');
    formData.append('usuarioParceiroid', this.usuario.id);
    formData.append('horario', formValues.horario);
    formData.append('faixaEtaria', formValues.faixaEtaria.toString());

    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('imagens', this.selectedFiles[i]);
    }

    this.eventoService.criarEvento(formData).subscribe({
      next: () => {
        this.snackBar.open('Evento criado com sucesso', 'Fechar', {
          duration: 3000,
        });
        this.router.navigate(['/']);
        this.isProcessing = false;
      },
      error: (erro) => {
        console.error('Erro ao criar evento:', erro);
        this.snackBar.open('Erro ao criar evento', 'Fechar', {
          duration: 3000,
        });
        this.isProcessing = false;
      },
    });
  }
}
