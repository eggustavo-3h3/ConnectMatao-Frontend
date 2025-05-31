import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';
import { CardEventosComponent } from '../components/card-eventos/card-eventos.component';
import { FiltroEventosComponent } from '../components/filtro-eventos/filtro-eventos.component';
import { FeedEventosComponent } from '../components/feed-eventos/feed-eventos.component';
import { IUsuario } from '../../interfaces/usuario.interface';
import { AuthService } from '../../services/auth.service';
import { Perfil } from '../../enums/perfil.enum';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    CardEventosComponent,
    FiltroEventosComponent,
    FeedEventosComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent {
  categoriaSelecionada: number | null = null;

  onCategoriaChange(categoriaId: number | null) {
    this.categoriaSelecionada = categoriaId;
  }
  get mostrarCarrossel(): boolean {
    return (
      this.categoriaSelecionada === null ||
      this.categoriaSelecionada === undefined
    );
  }
}
