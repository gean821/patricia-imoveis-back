import { Finalidade, StatusImovel, TipoImovel } from '@prisma/client';

export class ClienteImovelVinculadoResponseDto {
  vinculoId: string;
  imovelId: string;
  codigo: string;
  titulo: string;
  bairro: string;
  cidade: string;
  valor: number;
  status: StatusImovel;
  interesse: number;
  nota: string | null;
  vinculadoEm: Date;
}

export class ClienteResponseDto {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cpf: string | null;
  origem: string | null;
  observacoes: string | null;

  tipoDesejado: TipoImovel[];
  finalidadeDesejada: Finalidade | null;
  bairroDesejado: string | null;
  cidadeDesejada: string | null;
  valorMin: number | null;
  valorMax: number | null;
  quartosMin: number | null;
  vagasMin: number | null;

  imoveisVinculados: ClienteImovelVinculadoResponseDto[];
  totalInteracoes: number;
  totalImoveisVinculados: number;

  createdAt: Date;
  updatedAt: Date;
}

export class ClienteListItemResponseDto {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cidadeDesejada: string | null;
  bairroDesejado: string | null;
  finalidadeDesejada: Finalidade | null;
  totalInteracoes: number;
  totalImoveisVinculados: number;
  createdAt: Date;
}

export class ClienteImovelLinkResponseDto {
  vinculoId: string;
  clienteId: string;
  imovelId: string;
  interesse: number;
  nota: string | null;
  vinculadoEm: Date;
}
