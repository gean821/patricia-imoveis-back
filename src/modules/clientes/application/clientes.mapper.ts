import { ClienteImovel } from '@prisma/client';
import { ClienteDetailed, ClienteListItem } from '../repository/clientes.repository';
import {
  ClienteImovelLinkResponseDto,
  ClienteImovelVinculadoResponseDto,
  ClienteListItemResponseDto,
  ClienteResponseDto,
} from '../presentation/dto/cliente-response.dtos';

function decimalToNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value.toString());
}

function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value.toString());
}

function mapVinculo(
  vinculo: ClienteDetailed['imoveis'][number],
): ClienteImovelVinculadoResponseDto {
  return {
    vinculoId: vinculo.id,
    imovelId: vinculo.imovel.id,
    codigo: vinculo.imovel.codigo,
    titulo: vinculo.imovel.titulo,
    bairro: vinculo.imovel.bairro,
    cidade: vinculo.imovel.cidade,
    valor: decimalToNumber(vinculo.imovel.valor),
    status: vinculo.imovel.status,
    interesse: vinculo.interesse,
    nota: vinculo.nota,
    vinculadoEm: vinculo.createdAt,
  };
}

export function mapClienteToResponse(cliente: ClienteDetailed): ClienteResponseDto {
  return {
    id: cliente.id,
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email,
    cpf: cliente.cpf,
    origem: cliente.origem,
    observacoes: cliente.observacoes,

    tipoDesejado: cliente.tipoDesejado,
    finalidadeDesejada: cliente.finalidadeDesejada,
    bairroDesejado: cliente.bairroDesejado,
    cidadeDesejada: cliente.cidadeDesejada,
    valorMin: decimalToNumberOrNull(cliente.valorMin),
    valorMax: decimalToNumberOrNull(cliente.valorMax),
    quartosMin: cliente.quartosMin,
    vagasMin: cliente.vagasMin,

    imoveisVinculados: cliente.imoveis.map(mapVinculo),
    totalInteracoes: cliente._count.interacoes,
    totalImoveisVinculados: cliente._count.imoveis,

    createdAt: cliente.createdAt,
    updatedAt: cliente.updatedAt,
  };
}

export function mapClienteToListItem(cliente: ClienteListItem): ClienteListItemResponseDto {
  return {
    id: cliente.id,
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email,
    cidadeDesejada: cliente.cidadeDesejada,
    bairroDesejado: cliente.bairroDesejado,
    finalidadeDesejada: cliente.finalidadeDesejada,
    totalInteracoes: cliente._count.interacoes,
    totalImoveisVinculados: cliente._count.imoveis,
    createdAt: cliente.createdAt,
  };
}

export function mapClienteImovelLink(link: ClienteImovel): ClienteImovelLinkResponseDto {
  return {
    vinculoId: link.id,
    clienteId: link.clienteId,
    imovelId: link.imovelId,
    interesse: link.interesse,
    nota: link.nota,
    vinculadoEm: link.createdAt,
  };
}
