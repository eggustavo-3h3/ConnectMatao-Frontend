import { TipoEstatistica } from '../enums/tipo-estatistica.enum';
import { IEvento } from './evento.interface';
import { IUsuario } from './usuario.interface';

export interface IEventoEstatisticas {
  id?: number;
  tipoEstatistica: TipoEstatistica;
  usuarioid: string;
  eventoid: string;
  usuario?: IUsuario;
  evento?: IEvento;
}