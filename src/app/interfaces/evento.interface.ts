import { IEventoEstatisticas } from './evento-estatisticas.interface';
import { IUsuario } from './usuario.interface';
import { IEventoImagens } from './evento-imagens.interface';

export interface IEvento {
  id: string;
  titulo: string;
  descricao: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  telefone: string;
  whatsapp: string;
  email: string;
  data: Date;
  horario: string;
  faixaEtaria: number;
  flagAprovado: boolean;
  usuarioParceiroid: string;
  categoriaid: string;
  usuarioNome: string;
  usuarioImagem: string;
  eventoImagem: IEventoImagens;
  estatisticas: IEventoEstatisticas[];
}
