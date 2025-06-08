export interface IParceiro {
  id?: string;
  usuarioId?: string;
  nomeCompleto: string | null;
  cpf: string | null;
  telefone: string | null;
  flagAprovado: boolean;
  dataEnvio: Date | null;
  usuarioNome?: string;
  formParceiroExiste?: boolean;
}
