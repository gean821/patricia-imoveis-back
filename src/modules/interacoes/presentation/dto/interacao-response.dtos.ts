import { TipoInteracao } from '@prisma/client';

export class InteracaoClienteRefDto {
  id: string;
  nome: string;
  telefone: string;
}

export class InteracaoImovelRefDto {
  id: string;
  codigo: string;
  titulo: string;
}

export class InteracaoResponseDto {
  id: string;
  clienteId: string;
  imovelId: string | null;
  tipo: TipoInteracao;
  titulo: string | null;
  descricao: string | null;
  data: Date;
  createdAt: Date;

  cliente: InteracaoClienteRefDto;
  imovel: InteracaoImovelRefDto | null;
}
