import { Component } from '@angular/core';
import { NavbarComponent } from '../components/nav-bar/nav-bar.component';
import { CardEventosComponent } from '../components/card-eventos/card-eventos.component';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent, CardEventosComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent {}
