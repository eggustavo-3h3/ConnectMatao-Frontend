import { Component, Inject, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventoService } from '../../services/evento.service';
import { UsuarioService } from '../../services/usuario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IUsuario } from '../../interfaces/usuario.interface';
import { IEvento } from '../../interfaces/evento.interface';
import { IEventoEstatisticas } from '../../interfaces/evento-estatisticas.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../../angular_material/angular-material/angular-material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ParceiroStatusService } from '../../services/parceiro-status.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AngularMaterialModule,
    CommonModule,
    RouterLink,
  ],
})
export class PublicProfileComponent implements OnInit {
  userId: string | null = null;
  user: IUsuario | null = null;
  userEvents: IEvento[] = [];
  isLoggedIn: boolean = false;
  loggedInUserId: string | null = null;
  isEditNameModalOpen: boolean = false;
  isEditImageModalOpen: boolean = false;
  isImageModalOpen: boolean = false; // para controlar o modal de exibição da imagem
  editForm: FormGroup;
  imagePreviewUrl: string | null = null;
  excluirModalAberto: boolean = false;
  eventoParaExcluir!: IEvento;
  avaliacoes: IEventoEstatisticas[] = [];
  mediaAvaliacoes: number = 0;
  avaliacaoUsuario: number = 0;
  canEditProfile: boolean = false;
  isLoading: boolean = false;
  isProfilePartner: boolean = false;
  snackBar = inject(MatSnackBar);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private eventoService: EventoService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private parceiroStatusService: ParceiroStatusService
  ) {
    this.editForm = this.fb.group({
      nome: ['', Validators.required],
      imagem: [''],
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    if (this.isLoggedIn) {
      this.loggedInUserId = this.authService.getUserId();
    } else {
      this.loggedInUserId = null;
    }

    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.loadUserProfile(this.userId);
        this.loadUserEvents(this.userId);
      }
    });
  }

  loadUserProfile(userId: string): void {
    this.isLoading = true;
    this.isProfilePartner = false;

    this.usuarioService.getUserProfileById(userId).subscribe({
      next: (userProfile) => {
        this.user = userProfile;
        this.canEditProfile = this.loggedInUserId === this.user?.id?.toString();

        this.editForm.patchValue({
          nome: this.user?.nome,
          imagem: this.user?.imagem || '',
        });

        if (this.user?.id) {
          console.log(
            'Verificando status de parceiro para o ID:',
            this.user.id
          );
          this.parceiroStatusService
            .isUserApprovedPartner(this.user.id.toString())
            .subscribe({
              next: (isPartner) => {
                this.isProfilePartner = isPartner;
                console.log('Status do serviço (isPartner):', isPartner);
                console.log(
                  'isProfilePartner (no componente):',
                  this.isProfilePartner
                );
              },
              error: (err) => {
                console.error(
                  'Erro ao verificar status de parceiro no componente:',
                  err
                );
                this.isProfilePartner = false;
              },
            });
        } else {
          this.isProfilePartner = false;
          console.log('ID do perfil não encontrado, isProfilePartner = false.');
        }

        this.isLoading = false;
      },
      error: (error) => {
        this.isProfilePartner = false;
      },
    });
  }

  loadUserEvents(userId: string): void {
    this.isLoading = true;

    this.eventoService.getEventosPorUsuario(userId).subscribe({
      next: (events: IEvento[]) => {
        this.userEvents = events;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Erro ao carregar eventos do usuário', 'Fechar', {
          duration: 3000,
        });
        console.error('Erro ao carregar eventos do usuário:', error);
        this.userEvents = [];
        this.isLoading = false;
      },
    });
  }

  confirmDeleteEvent(event: IEvento): void {
    this.eventoParaExcluir = event;
    this.excluirModalAberto = true;
  }

  cancelDeleteEvent(): void {
    this.excluirModalAberto = false;
    this.eventoParaExcluir = {} as IEvento;
  }

  deleteEvent(): void {
    if (!this.eventoParaExcluir) {
      console.warn('Nenhum evento selecionado para exclusão');
      return;
    }

    const eventoId = String(this.eventoParaExcluir.id);

    if (!eventoId) {
      console.error(
        'ID do evento inválido para exclusão:',
        this.eventoParaExcluir.id
      );
      this.snackBar.open(
        'ID do evento inválido. Exclusão cancelada.',
        'Fechar',
        {
          duration: 3000,
        }
      );
      return;
    }

    this.eventoService.removerEvento(eventoId).subscribe({
      next: () => {
        this.loadUserEvents(this.userId!);
        this.closeDeleteModal();
        this.snackBar.open('Evento excluído com sucesso!', 'Fechar', {
          duration: 3000,
        });
      },
      error: (error) => {
        console.error('Erro ao excluir evento:', error);
        this.closeDeleteModal();
        this.snackBar.open(
          'Erro ao excluir o evento. Tente novamente.',
          'Fechar',
          { duration: 3000 }
        );
      },
    });
  }

  openEditNameModal(): void {
    this.isEditNameModalOpen = true;
  }

  closeEditNameModal(): void {
    this.isEditNameModalOpen = false;
  }

  openEditImageModal(): void {
    this.isEditImageModalOpen = true;
    this.imagePreviewUrl = null;
  }

  closeEditImageModal(): void {
    this.isEditImageModalOpen = false;
    this.editForm.patchValue({ imagem: this.user?.imagem || '' });
    this.imagePreviewUrl = null;
  }

  //Métodos para o modal de exibição da imagem
  openImageModal(): void {
    this.isImageModalOpen = true;
  }

  closeImageModal(): void {
    this.isImageModalOpen = false;
  }

  handleImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file);
    }
  }

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.editForm.patchValue({ imagem: e.target.result.split(',')[1] });
      this.imagePreviewUrl = e.target.result;
    };
    reader.onerror = (error) => {
      console.error('Erro ao ler a imagem:', error);
      this.editForm.patchValue({ imagem: '' });
      this.imagePreviewUrl = null;
    };
    reader.readAsDataURL(file);
  }

  updateImage(): void {
    if (this.user && this.loggedInUserId === this.user.id?.toString()) {
      const updatedProfile: IUsuario = {
        ...this.user,
        imagem: this.editForm.value.imagem || '',
      };

      this.usuarioService.updateUserProfile(updatedProfile).subscribe({
        next: () => {
          this.snackBar.open('Imagem atualizada com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.closeEditImageModal();
          this.loadUserProfile(this.userId!);
        },
        error: (error) => {
          console.error('Erro ao atualizar a imagem:', error);
          this.snackBar.open(
            'Erro ao atualizar a imagem de perfil. Tente novamente.',
            'Fechar',
            { duration: 3000 }
          );
        },
      });
    } else {
      console.warn('IDs não correspondem. A operação não pode ser realizada.');
    }
  }

  updateName(): void {
    if (this.user && this.loggedInUserId === this.user.id?.toString()) {
      if (!this.editForm.value.nome.trim()) {
        this.snackBar.open('O nome não pode estar vazio.', 'Fechar', {
          duration: 3000,
        });
        return;
      }

      const updatedProfile: IUsuario = {
        ...this.user,
        nome: this.editForm.value.nome,
      };

      this.usuarioService.updateUserProfile(updatedProfile).subscribe({
        next: () => {
          this.snackBar.open('Nome atualizado com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.closeEditNameModal();
          if (this.user) {
            this.user.nome = this.editForm.value.nome;
          }
        },
        error: (error) => {
          console.error('Erro ao atualizar o nome:', error);
          this.snackBar.open(
            'Erro ao atualizar o nome de perfil. Tente novamente.',
            'Fechar',
            { duration: 3000 }
          );
          this.closeEditNameModal();
        },
      });
    } else {
      console.error('IDs não correspondem. A operação não pode ser realizada.');
    }
  }

  closeDeleteModal(): void {
    this.excluirModalAberto = false;
    this.eventoParaExcluir = {} as IEvento;
  }
}
