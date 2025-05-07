import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
} from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { EventoService } from '../../../services/evento.service';
import { IUsuario } from '../../../interfaces/usuario.interface';
import { IEvento } from '../../../interfaces/evento.interface';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-navbar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
  ],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isDropdownVisible = false;
  searchResults: IEvento[] = [];
  isSearchFocused = false;
  userImageUrl: string = '';
  userName: string = '';
  usuario: IUsuario | null = null;
  menuOpen = false;
  isNavbarVisible = true;
  lastScrollTop = 0;

  @ViewChild('searchInput') searchInput!: ElementRef;

  private authSubscription?: Subscription;
  private searchTerms = new Subject<string>();

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private eventoService: EventoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        if (loggedIn) {
          this.loadUserProfile();
        } else {
          this.userImageUrl = '';
          this.userName = '';
        }
        window.addEventListener('scroll', this.onScroll.bind(this));
      }
    );

    if (this.authService.isAuthenticated()) {
      this.isLoggedIn = true;
      this.loadUserProfile();
    }

    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.eventoService.searchEvents(term))
      )
      .subscribe({
        next: (events) => {
          this.searchResults = events;
        },
        error: (err) => {
          console.error('Erro na pesquisa de eventos', err);
          this.searchResults = [];
        },
      });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  private loadUserProfile(): void {
    this.usuarioService
      .getPerfilUsuario()
      .pipe(take(1))
      .subscribe({
        next: (usuario: IUsuario) => {
          this.usuario = usuario;
          this.userImageUrl = usuario.imagem
            ? `data:image/jpeg;base64,${usuario.imagem}`
            : 'assets/default-user.png';
          this.userName = usuario.nome;
        },
        error: (err) => {
          console.error('Erro ao carregar perfil:', err);
          this.userImageUrl = 'assets/default-user.png';
          this.userName = '';
        },
      });
  }

  onScroll(): void {
    const currentScrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScrollTop > this.lastScrollTop && currentScrollTop > 200) {
      this.isNavbarVisible = false;
    } else {
      this.isNavbarVisible = true;
    }

    this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isDropdownVisible = false;
    this.isLoggedIn = false;
    this.userImageUrl = '';
    this.userName = '';
  }

  goToProfile(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.router.navigate([`/perfil/${userId}`]);
    } else {
      console.warn('ID de usuário não disponível.');
      this.isDropdownVisible = false;
    }
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  onSearchBlur(): void {
    setTimeout(() => (this.isSearchFocused = false), 200);
  }

  goToEventDetails(eventId: number | string | undefined): void {
    if (eventId) {
      this.router.navigate(['/detalhe-evento', eventId.toString()]);
      this.searchResults = [];
      this.searchInput.nativeElement.value = '';
    }
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }
}
