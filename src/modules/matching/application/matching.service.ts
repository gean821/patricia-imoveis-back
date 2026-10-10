import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ClienteMatchPrefs,
  ImovelMatchKeys,
  MatchingRepository,
} from '../repository/matching.repository';
import {
  ClientesParaImovelQueryDto,
  ImoveisParaClienteQueryDto,
} from '../presentation/dto/matching.dtos';
import { ImovelListItemResponseDto } from '../../imoveis/presentation/dto/imovel-response.dtos';
import { ClienteListItemResponseDto } from '../../clientes/presentation/dto/cliente-response.dtos';
import { mapImovelToListItem } from '../../imoveis/application/imoveis.mapper';
import { mapClienteToListItem } from '../../clientes/application/clientes.mapper';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly repo: MatchingRepository) {}

  async imoveisParaCliente(
    clienteId: string,
    query: ImoveisParaClienteQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    const prefs = await this.findClientePrefs(clienteId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = await this.buildImoveisWhere(prefs);

    const { items, total } = await this.repo.findMatchingImoveis({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    return new PaginatedResponseDto(items.map(mapImovelToListItem), total, page, limit);
  }

  async clientesParaImovel(
    imovelId: string,
    query: ClientesParaImovelQueryDto,
  ): Promise<PaginatedResponseDto<ClienteListItemResponseDto>> {
    const imovel = await this.findImovelKeys(imovelId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = await this.buildClientesWhere(imovel);

    const { items, total } = await this.repo.findMatchingClientes({
      skip: (page - 1) * limit,
      take: limit,
      where,
    });

    return new PaginatedResponseDto(items.map(mapClienteToListItem), total, page, limit);
  }

  private async findClientePrefs(id: string): Promise<ClienteMatchPrefs> {
    const cliente = await this.repo.findClientePrefs(id);

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  private async findImovelKeys(id: string): Promise<ImovelMatchKeys> {
    const imovel = await this.repo.findImovelKeys(id);

    if (!imovel) {
      throw new NotFoundException('Imóvel não encontrado');
    }

    return imovel;
  }

  private async buildImoveisWhere(prefs: ClienteMatchPrefs): Promise<Prisma.ImovelWhereInput> {
    const where: Prisma.ImovelWhereInput = {
      deletedAt: null,
      status: 'DISPONIVEL',
    };
    const filtrosTexto: Prisma.ImovelWhereInput[] = [];

    if (prefs.tipoDesejado.length > 0) {
      where.tipo = { in: prefs.tipoDesejado };
    }
    if (prefs.finalidadeDesejada) {
      where.OR = [{ finalidade: prefs.finalidadeDesejada }, { finalidade: 'AMBOS' }];
    }
    if (prefs.cidadeDesejada) {
      const ids = await this.repo.findImovelIdsPorTexto(['cidade'], prefs.cidadeDesejada, 'contem');
      filtrosTexto.push({ id: { in: ids } });
    }
    if (prefs.bairroDesejado) {
      const ids = await this.repo.findImovelIdsPorTexto(['bairro'], prefs.bairroDesejado, 'contem');
      filtrosTexto.push({ id: { in: ids } });
    }
    if (filtrosTexto.length > 0) {
      where.AND = filtrosTexto;
    }
    if (prefs.valorMin || prefs.valorMax) {
      where.valor = {};
      if (prefs.valorMin) {
        where.valor.gte = prefs.valorMin;
      }
      if (prefs.valorMax) {
        where.valor.lte = prefs.valorMax;
      }
    }
    if (prefs.quartosMin) {
      where.quartos = { gte: prefs.quartosMin };
    }
    if (prefs.vagasMin) {
      where.vagas = { gte: prefs.vagasMin };
    }

    return where;
  }

  private async buildClientesWhere(imovel: ImovelMatchKeys): Promise<Prisma.ClienteWhereInput> {
    const idsMesmaCidade = await this.repo.findClienteIdsPorTexto(
      ['cidadeDesejada'],
      imovel.cidade,
      'igual',
    );
    const conditions: Prisma.ClienteWhereInput[] = [
      { OR: [{ tipoDesejado: { has: imovel.tipo } }, { tipoDesejado: { isEmpty: true } }] },
      { OR: [{ cidadeDesejada: null }, { id: { in: idsMesmaCidade } }] },
      { OR: [{ valorMin: null }, { valorMin: { lte: imovel.valor } }] },
      { OR: [{ valorMax: null }, { valorMax: { gte: imovel.valor } }] },
    ];

    if (imovel.quartos !== null && imovel.quartos !== undefined) {
      conditions.push({
        OR: [{ quartosMin: null }, { quartosMin: { lte: imovel.quartos } }],
      });
    }

    return {
      deletedAt: null,
      AND: conditions,
    };
  }
}
