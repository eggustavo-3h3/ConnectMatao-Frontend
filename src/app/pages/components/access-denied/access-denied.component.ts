import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necessário para diretivas como ngIf, ngFor se usar
import { RouterLink } from '@angular/router'; // Para o botão de voltar, se usar

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css'],
  standalone: true, // Use standalone se seu projeto for configurado assim
  imports: [CommonModule, RouterLink], // Importe CommonModule e RouterLink
})
export class AccessDeniedComponent {
  // Você pode adicionar lógica aqui se precisar, mas para uma página simples de acesso negado, não é necessário.
}
