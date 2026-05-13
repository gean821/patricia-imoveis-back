import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClientesRepository, ClienteDetailed, ClienteListItem } from '../repository/clientes.repository';
import { CreateClienteDto, ListClientesQueryDto, UpdateClienteDto } from '../presentation/dto/cliente.dtos';
import { PaginatedResponse } from '../../imoveis/application/imoveis.service';

@Injectable()
export class ClientesService {
  constructor(private readonly repo: ClientesRepository) { }

  create(dto: CreateClienteDto): Promise<ClienteDetailed> {
    return this.repo.create(dto as Prisma.ClienteCreateInput);
  }

  async findById(id: string): Promise<ClienteDetailed> {
    const cliente = await this.repo.findById(id);

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }

    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto): Promise<ClienteDetailed> {
    await this.findById(id);
    return this.repo.update(id, dto as Prisma.ClienteUpdateInput);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repo.softDelete(id);
  }

  async list(query: ListClientesQueryDto): Promise<PaginatedResponse<ClienteListItem>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.ClienteWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { nome: { contains: query.search, mode: 'insensitive' } },
        { telefone: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { cpf: { contains: query.search } },
      ];
    }
    if (query.tipoDesejado) where.tipoDesejado = { has: query.tipoDesejado };
    if (query.cidadeDesejada) {
      where.cidadeDesejada = { contains: query.cidadeDesejada, mode: 'insensitive' };
    }

    const { items, total } = await this.repo.findManyWithTotal({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });
    return { items, total, page, limit };
  }

  async linkImovel(clienteId: string, imovelId: string, interesse?: number, nota?: string) {
    await this.findById(clienteId);
    return this.repo.upsertImovelLink(clienteId, imovelId, interesse ?? 3, nota);
  }

  async unlinkImovel(clienteId: string, imovelId: string) {
    await this.findById(clienteId);
    return this.repo.removeImovelLink(clienteId, imovelId);
  }
}