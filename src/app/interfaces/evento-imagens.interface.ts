import { IEvento } from './evento.interface';

export interface IEventoImagens {
  id?: number;
  imagem: string;
  eventoId?: number;
  evento?: IEvento;
}
