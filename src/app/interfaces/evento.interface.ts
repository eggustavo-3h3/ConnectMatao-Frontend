export interface IEvento {
  id?: number;
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
  imagens: {imagem: string}[];
  usuarioInteragiu?: boolean;
}