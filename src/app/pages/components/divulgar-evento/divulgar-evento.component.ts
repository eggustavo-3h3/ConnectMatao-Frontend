import { Component } from '@angular/core';
import { NavbarComponent } from '../nav-bar/nav-bar.component';
import { HomeComponent } from '../../home/home.component';
import { ICategoria } from '../../../interfaces/categoria.interface';
import { EventoService } from '../../../services/evento.service';

@Component({
  selector: 'app-divulgar-evento',
  imports: [NavbarComponent, HomeComponent],
  templateUrl: './divulgar-evento.component.html',
  styleUrl: './divulgar-evento.component.css',
  standalone: true,
})
export class DivulgarEventoComponent {
  constructor(private eventoService: EventoService) {}
}
