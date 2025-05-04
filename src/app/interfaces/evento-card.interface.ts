import { IEvento } from './evento.interface';

export interface IEventoCard extends IEvento {
  usuarioNome: string;
  usuarioImagem: string;
  eventoImagem: string[];
}
