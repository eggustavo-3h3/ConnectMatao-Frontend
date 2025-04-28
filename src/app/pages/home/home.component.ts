import { Component } from '@angular/core';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';
import { CardEventosComponent } from '../components/card-eventos/card-eventos.component';
import { FiltroEventosComponent } from '../components/filtro-eventos/filtro-eventos.component';
import { FeedEventosComponent } from '../components/feed-eventos/feed-eventos.component';

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
export class HomeComponent {}
