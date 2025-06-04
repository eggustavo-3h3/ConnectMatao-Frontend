export interface IParceiro {
  id?: string; // Making ID optional as it might not exist until saved
  usuarioId?: string; // Making usuarioId optional too
  nomeCompleto: string | null; // Allow null if not yet provided
  cpf: string | null; // Allow null if not yet provided
  telefone: string | null; // Allow null if not yet provided
  flagAprovado: boolean;
  dataEnvio: Date | null; // Date can be null if not submitted
  usuarioNome?: string; // Optional, as discussed previously
  formParceiroExiste?: boolean;
}
