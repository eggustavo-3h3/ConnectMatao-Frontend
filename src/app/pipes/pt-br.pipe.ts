import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ptBr',
})
export class PtBrPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) return '';

    const datePipe = new DatePipe('pt-BR');
    return datePipe.transform(value, 'dd/MM/yyyy') || '';
  }
}
