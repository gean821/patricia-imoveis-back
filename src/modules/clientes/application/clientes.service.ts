import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ClientesRepository,
  ClienteDetailed,
} from '../repository/clientes.repository';
import {
  CreateClienteDto,
  ListClientesQueryDto,
  UpdateClienteDto,
} from '../presentation/dto/cliente.dtos';
import {
  ClienteImovelLinkResponseDto,
  ClienteListItemResponseDto,
  ClienteResponseDto,
} from '../presentation/dto/cliente-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import {
  mapClienteImovelLink,
  mapClienteToListItem,
  mapClienteToResponse,
} from './clientes.mapper';

@Injectable()
export class ClientesService {
  constructor(private readonly repo: ClientesRepository) { }

  async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
    const created = await this.repo.create(dto as unknown as Prisma.ClienteCreateInput);
    return mapClienteToResponse(created);
  }

  async findById(id: string): Promise<ClienteResponseDto> {
    const cliente = await this.findEntityById(id);
    return mapClienteToResponse(cliente);
  }

  async update(id: string, dto: UpdateClienteDto): Promise<ClienteResponseDto> {
    await this.findEntityById(id);
    const updated = await this.repo.update(
      id,
      dto as unknown as Prisma.ClienteUpdateInput,
    );
    return mapClienteToResponse(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findEntityById(id);
    await this.repo.softDelete(id);
  }

  async list(
    query: ListClientesQueryDto,
  ): Promise<PaginatedResponseDto<ClienteListItemResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = await this.buildWhere(query);

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    return new PaginatedResponseDto(items.map(mapClienteToListItem), total, page, limit);
  }

  async linkImovel(
    clienteId: string,
    imovelId: string,
    interesse?: number,
    nota?: string,
  ): Promise<ClienteImovelLinkResponseDto> {
    await this.findEntityById(clienteId);
    const link = await this.repo.upsertImovelLink(clienteId, imovelId, interesse ?? 3, nota);
    return mapClienteImovelLink(link);
  }

  async unlinkImovel(clienteId: string, imovelId: string): Promise<void> {
    await this.findEntityById(clienteId);
    await this.repo.removeImovelLink(clienteId, imovelId);
  }

  private async findEntityById(id: string): Promise<ClienteDetailed> {
    const cliente = await this.repo.findById(id);

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  private async buildWhere(query: ListClientesQueryDto): Promise<Prisma.ClienteWhereInput> {
    const where: Prisma.ClienteWhereInput = { deletedAt: null };
    const filtrosTexto: Prisma.ClienteWhereInput[] = [];

    if (query.search) {
      const ids = await this.repo.findIdsPorTexto(['nome', 'email'], query.search, 'contem');
      filtrosTexto.push({
        OR: [
          { id: { in: ids } },
          { telefone: { contains: query.search } },
          { cpf: { contains: query.search } },
        ],
      });
    }
    if (query.tipoDesejado) {
      where.tipoDesejado = { has: query.tipoDesejado };
    }
    if (query.cidadeDesejada) {
      const ids = await this.repo.findIdsPorTexto(
        ['cidadeDesejada'],
        query.cidadeDesejada,
        'contem',
      );
      filtrosTexto.push({ id: { in: ids } });
    }
    if (filtrosTexto.length > 0) {
      where.AND = filtrosTexto;
    }

    return where;
  }
}
