import { ICategoria } from './categoria.interface';

export interface IEvento {
  id?: string;
  titulo: string;
  descricao: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  telefone: string;
  whatsapp: string;
  email: string;
  data: string;
  categoriaid: string;
  flagAprovado: boolean;
  usuarioParceiroid: string;
  horario: string;
  faixaEtaria: number;
  imagens: string[];
  usuarioInteragiu?: boolean;
  isCreatorPartner?: boolean; // Propriedade para indicar se o criador é parceiro
  categoriaNome?: string;
}
