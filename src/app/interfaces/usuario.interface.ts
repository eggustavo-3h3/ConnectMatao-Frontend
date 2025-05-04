import { Perfil } from '../enums/perfil.enum';

export interface IUsuario {
  id: number;
  nome: string;
  login: string;
  senha: string;
  imagem: string;
  perfil: Perfil;
}
