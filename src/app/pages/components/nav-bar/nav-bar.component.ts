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
        // this.loadUserProfile();
      }
    );

    this.isLoggedIn = this.authService.isAuthenticated();
    // this.loadUserProfile();

    // this.searchTerms
    //   .pipe(
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     switchMap((term: string) => {
    //       if (term.trim()) {
    //         return this.eventoService.searchEvents(term);
    //       } else {
    //         return [];
    //       }
    //     })
    //   )
    //   .subscribe((results: IEvento[]) => {
    //     this.searchResults = results;
    //   });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isDropdownVisible = false;
    this.isLoggedIn = false;
  }

  // goToProfile(): void {
  //   const userId = this.authService.getUserId();
  //   if (userId) {
  //     this.router.navigate(['/profile/usuario', userId]);
  //   } else {
  //     console.warn('ID de usuário não disponível.');
  //     this.loadUserProfile();
  //   }
  //   this.isDropdownVisible = false;
  // }

  onSearchFocus(): void {
    this.isSearchFocused = true;
  }

  onSearchBlur(): void {
    setTimeout(() => (this.isSearchFocused = false), 200);
  }

  goToEventDetails(eventId: string | undefined): void {
    if (eventId) {
      this.router.navigate(['/detalhe-evento', eventId]);
      this.searchResults = [];
      this.searchInput.nativeElement.value = '';
    }
  }
}
