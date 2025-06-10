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
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { IEvento } from '../../../interfaces/evento.interface';

registerLocaleData(localePt);

@Component({
  selector: 'app-divulgar-evento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularMaterialModule
  ],
  templateUrl: './divulgar-evento.component.html',
  styleUrls: ['./divulgar-evento.component.css'],
})
export class DivulgarEventoComponent implements OnInit {
  eventoForm: FormGroup;
  categorias: any[] = [];
  imagemPreview: string[] = [];
  usuario: any = null;
  minDate: Date;
  selectedFiles: File[] = [];
  isProcessing = false;
  currentImageIndex = 0;
  formTriedSubmit = false;
  isDragOver = false;
  faixasEtariasDisponiveis: string[] = [
    'Livre',
    '+10 anos',
    '+12 anos',
    '+14 anos',
    '+16 anos',
    '+18 anos',
  ];

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
      titulo: ['', [Validators.required, Validators.maxLength(150)]],
      descricao: ['', [Validators.required, Validators.maxLength(800)]],
      cep: [
        '',
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern(/^\d{5}-?\d{3}$/),
        ],
      ],
      logradouro: ['', [Validators.required, Validators.maxLength(150)]],
      numero: ['', [Validators.required, Validators.maxLength(5)]],
      bairro: ['', [Validators.required, Validators.maxLength(100)]],
      telefone: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^\(?\d{2}\)?\s?(9?\d{4}-?\d{4})$/),
        ],
      ],
      whatsapp: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/), // Assume 9 digitos
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(200)],
      ],
      data: ['', [Validators.required]],
      horario: [
        '',
        [
          Validators.required,
          Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/),
        ],
      ],
      faixaEtaria: ['', [Validators.required]],
      categoria: ['', Validators.required],
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

    this.eventoForm.get('data')?.valueChanges.subscribe((value) => {
      if (value) {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        this.minDate.setHours(0, 0, 0, 0);

        if (selectedDate < this.minDate) {
          this.eventoForm.get('data')?.setErrors({ dataPassada: true });
        } else {
          if (this.eventoForm.get('data')?.hasError('dataPassada')) {
            delete this.eventoForm.get('data')?.errors?.['dataPassada'];
            this.eventoForm.get('data')?.updateValueAndValidity();
          }
        }
      }
    });
  }

  formatInput(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (field === 'telefone') {
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      if (value.length > 10) {
        // (XX) XXXXX-XXXX
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (value.length > 6) {
        // (XX) XXXX-XXXX (para números fixos com 8 digitos)
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (value.length > 2) {
        // (XX) XXXX
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (value.length > 0) {
        // (XX
        value = value.replace(/^(\d*)/, '($1');
      }
    } else if (field === 'whatsapp') {
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      // Sempre 9 digitos para WhatsApp em Matão
      if (value.length > 10) {
        // (XX) XXXXX-XXXX
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
      } else if (value.length > 6) {
        // (XX) XXXXX-X (para números com 9 digitos)
        value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (value.length > 2) {
        // (XX) XXXXX
        value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (value.length > 0) {
        // (XX
        value = value.replace(/^(\d*)/, '($1');
      }
    } else if (field === 'cep') {
      if (value.length > 8) {
        value = value.substring(0, 8);
      }
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
      }
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

  removeCurrentImage(): void {
    if (this.imagemPreview.length > 0) {
      this.selectedFiles.splice(this.currentImageIndex, 1);
      this.imagemPreview.splice(this.currentImageIndex, 1);

      if (this.currentImageIndex >= this.imagemPreview.length) {
        this.currentImageIndex = Math.max(this.imagemPreview.length - 1, 0);
      }
    } else {
      this.currentImageIndex = 0;
    }
  }

  carregarCategorias(): void {
    this.categoriaService.listarCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
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
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    this.selectedFiles = [...this.selectedFiles, ...files];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagemPreview.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  onSubmit(): void {
    this.formTriedSubmit = true;
    this.eventoForm.markAllAsTouched();

    if (this.eventoForm.get('data')?.hasError('dataPassada')) {
      this.snackBar.open(
        'A data do evento não pode ser no passado.',
        'Fechar',
        { duration: 3000 }
      );
      return;
    }

    if (
      this.eventoForm.invalid ||
      !this.usuario ||
      this.selectedFiles.length === 0
    ) {
      if (this.selectedFiles.length === 0) {
        this.snackBar.open('Adicione pelo menos uma imagem.', 'Fechar', {
          duration: 3000,
        });
      } else {
        this.snackBar.open('Preencha todos os campos corretamente.', 'Fechar', {
          duration: 3000,
        });
      }
      return;
    }

    this.isProcessing = true;
    const fv = this.eventoForm.value;

    const toBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    Promise.all(this.selectedFiles.map((f) => toBase64(f)))
      .then((base64List) => {
        const payload: IEvento = {
          titulo: fv.titulo,
          descricao: fv.descricao,
          cep: fv.cep.replace(/\D/g, ''),
          logradouro: fv.logradouro,
          numero: fv.numero,
          bairro: fv.bairro,
          telefone: fv.telefone.replace(/\D/g, ''),
          whatsapp: fv.whatsapp.replace(/\D/g, ''),
          email: fv.email,
          data: new Date(fv.data).toISOString(),
          horario: fv.horario,
          faixaEtaria: fv.faixaEtaria,
          categoriaid: fv.categoria,
          flagAprovado: false,
          usuarioParceiroid: this.usuario.id,
          imagens: base64List,
        };

        console.log('Payload do evento:', payload);

        this.eventoService
          .criarEvento(payload)
          .subscribe({
            next: () => {
              this.snackBar.open('Evento criado com sucesso', 'Fechar', {
                duration: 3000,
              });
              this.router.navigate(['/']);
            },
            error: (err) => {
              console.error('Erro ao criar evento:', err);
              let errorMessage = 'Erro ao criar evento. Tente novamente.';

              if (err.status === 400) {
                if (err.error?.mensagem) {
                  errorMessage = err.error.mensagem;
                } else if (Array.isArray(err.error)) {
                  errorMessage = `Erro de validação: ${err.error.join(', ')}`;
                }
              }
              this.snackBar.open(errorMessage, 'Fechar', {
                duration: 3000,
              });
              console.log('Payload do evento que causou o erro:', payload);
            },
          })
          .add(() => {
            this.isProcessing = false;
          });
      })
      .catch((err) => {
        console.error('Falha na conversão de imagens:', err);
        this.snackBar.open('Erro ao processar imagens', 'Fechar', {
          duration: 3000,
        });
        this.isProcessing = false;
      });
  }

  nextImage(): void {
    if (this.currentImageIndex < this.imagemPreview.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);

      this.selectedFiles = [...this.selectedFiles, ...files];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagemPreview.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });

      event.dataTransfer.clearData();
    }
  }
}
