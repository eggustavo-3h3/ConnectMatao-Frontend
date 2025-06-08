import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ICategoria } from '../../../interfaces/categoria.interface';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filtro-eventos',
  templateUrl: './filtro-eventos.component.html',
  styleUrls: ['./filtro-eventos.component.css'],
  imports: [FormsModule, CommonModule],
  standalone: true,
})
export class FiltroEventosComponent implements OnInit {
  isModalOpen = false;
  filters: { categoryId: number | null } = { categoryId: null };
  categorias: ICategoria[] = [];
  @Output() filterChanged = new EventEmitter<number | null>();

  private apiUrl = 'https://connectmatao-api.tccnapratica.com.br';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.http.get<ICategoria[]>(`${this.apiUrl}/categoria/listar`).subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    );
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  applyFilters() {
    console.log('Filtros aplicados:', this.filters);
    this.filterChanged.emit(this.filters.categoryId); // Emite o filtro para o componente pai
    this.closeModal();
  }

  clearFilters() {
    this.filters = { categoryId: null };
    this.filterChanged.emit(null); // Se limpar, emite null para mostrar todos os eventos
  }

  selectCategory(category: ICategoria) {
    this.filters.categoryId = category.id ?? null;
  }
}
