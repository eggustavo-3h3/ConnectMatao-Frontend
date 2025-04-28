import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EventoService } from '../../services/evento.service';
import { UsuarioService } from '../../services/usuario.service';
import { HttpErrorResponse } from '@angular/common/http';
import { IUsuario } from '../../interfaces/usuario.interface';
import { IEvento } from '../../interfaces/evento.interface';
import { IEventoEstatisticas } from '../../interfaces/evento-estatisticas.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IEventoCard } from '../../interfaces/evento-card.interface';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
})
export class PublicProfileComponent implements OnInit {
  userId: string | null = null;
  user: IUsuario | null = null;
  userEvents: IEvento[] = [];
  isLoggedIn: boolean = false;
  loggedInUserId: string | null = null;
  isEditNameModalOpen: boolean = false;
  isEditImageModalOpen: boolean = false;
  editNome: string = '';
  editImagem: string = '';
  imagePreviewUrl: string | null = null;
  excluirModalAberto: boolean = false;
  eventoParaExcluir: IEvento | null = null;
  avaliacoes: IEventoEstatisticas[] = [];
  mediaAvaliacoes: number = 0;
  avaliacaoUsuario: number = 0;
  canEditProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private eventoService: EventoService,
    private usuarioService: UsuarioService
  ) {}

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
        this.loadUserEvents(this.userId); // Carregar eventos ao carregar o perfil
      }
    });
  }

  loadUserProfile(userId: string): void {
    this.usuarioService.getUserProfileById(userId).subscribe({
      next: (userProfile) => {
        this.user = userProfile;
        if (this.user) {
          this.canEditProfile = this.loggedInUserId === this.user.id.toString();
        }
      },
      error: (error) => {
        console.error('Erro ao carregar perfil do usuário:', error);
        this.user = null;
      },
    });
  }

  loadUserEvents(userId: string): void {
    this.eventoService.getEventosPorUsuario(userId).subscribe({
      next: (events: IEvento[]) => {
        this.userEvents = events;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao carregar eventos do usuário:', error);
        this.userEvents = [];
      },
    });
  }

  confirmDeleteEvent(event: IEvento): void {
    this.eventoParaExcluir = event;
    this.excluirModalAberto = true;
  }

  cancelDeleteEvent(): void {
    this.excluirModalAberto = false;
    this.eventoParaExcluir = null;
  }

  deleteEvent(): void {
    if (this.eventoParaExcluir) {
      this.eventoService
        .removerEvento(Number(this.eventoParaExcluir.id))
        .subscribe({
          next: () => {
            this.loadUserEvents(this.userId!); // Recarregar eventos após exclusão
            this.closeDeleteModal();
          },
          error: (error) => {
            console.error('Erro ao excluir evento:', error);
            this.closeDeleteModal();
          },
        });
    } else {
      console.warn('Nenhum evento selecionado para exclusão');
    }
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
    this.editImagem = this.user?.imagem || '';
    this.imagePreviewUrl = null;
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
      this.editImagem = e.target.result.split(',')[1];
      this.imagePreviewUrl = e.target.result;
    };
    reader.onerror = (error) => {
      console.error('Erro ao ler a imagem:', error);
      this.editImagem = '';
      this.imagePreviewUrl = null;
    };
    reader.readAsDataURL(file);
  }

  updateImage(): void {
    if (this.user && this.loggedInUserId === this.user.id.toString()) {
      this.user.imagem = this.editImagem || ''; // Atualiza localmente
      const updatedProfile: IUsuario = {
        ...this.user,
        imagem: this.editImagem || '',
      };

      this.usuarioService.updateUserProfile(updatedProfile).subscribe({
        next: (response) => {
          // Atualize o perfil localmente sem recarregar tudo
          alert('Imagem atualizada com sucesso!');
        },
        error: (error) => {
          console.error('Erro ao atualizar a imagem:', error);
          alert('Erro ao atualizar a imagem de perfil. Tente novamente.');
        },
      });
    } else {
      console.warn('IDs não correspondem. A operação não pode ser realizada.');
    }
  }

  updateName(): void {
    if (this.user && this.loggedInUserId === this.user.id.toString()) {
      if (!this.editNome.trim()) {
        alert('O nome não pode estar vazio.');
        return;
      }

      this.user.nome = this.editNome; // Atualizando localmente

      const updatedProfile: IUsuario = {
        ...this.user,
        nome: this.editNome,
      };

      this.usuarioService.updateUserProfile(updatedProfile).subscribe({
        next: (response) => {
          alert('Nome atualizado com sucesso!');
          this.closeEditNameModal();
        },
        error: (error) => {
          console.error('Erro ao atualizar o nome:', error);
          alert('Erro ao atualizar o nome de perfil. Tente novamente.');
        },
      });
    }
  }

  closeDeleteModal(): void {
    this.excluirModalAberto = false;
    this.eventoParaExcluir = null;
  }
}
