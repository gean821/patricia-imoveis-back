import { Injectable, Logger } from '@nestjs/common';
import { Finalidade, Prisma, TipoImovel } from '@prisma/client';
import {
  AlertasRepository,
  ClienteAlerta,
} from '../repository/alertas.repository';
import { CreateAlertaImovelDto } from '../presentation/dto/alerta.dtos';
import { AlertaImovelResponseDto } from '../presentation/dto/alerta-response.dtos';
import { mapAlertaToResponse } from './alertas.mapper';

export const ORIGEM_ALERTA = 'Site - Me avise';

const TIPO_LABELS: Record<TipoImovel, string> = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  SOBRADO: 'Sobrado',
  COBERTURA: 'Cobertura',
  STUDIO: 'Studio',
  TERRENO: 'Terreno',
  CHACARA: 'Chácara',
  SITIO: 'Sítio',
  FAZENDA: 'Fazenda',
  COMERCIAL: 'Comercial',
  GALPAO: 'Galpão',
  SALA: 'Sala',
  CASA_DE_CONDOMINIO: 'Casa de condomínio',
};

const FINALIDADE_LABELS: Record<Finalidade, string> = {
  VENDA: 'Compra',
  ALUGUEL: 'Aluguel',
  AMBOS: 'Compra ou aluguel',
  LANCAMENTO: 'Lançamento',
};

@Injectable()
export class AlertasService {
  private readonly logger = new Logger(AlertasService.name);

  constructor(private readonly repo: AlertasRepository) { }

  async registrar(dto: CreateAlertaImovelDto): Promise<AlertaImovelResponseDto> {
    if (dto.website) {
      this.logger.warn('Pedido de alerta descartado (honeypot preenchido)');
      return mapAlertaToResponse();
    }

    const digitos = dto.telefone.replace(/\D/g, '');

    const imovelId = dto.imovelCodigo
      ? await this.repo.findImovelIdPorCodigo(dto.imovelCodigo)
      : null;

    const interacao = {
      titulo: 'Pediu aviso de imóvel pelo site',
      descricao: this.descreverPedido(dto),
      imovelId: imovelId ?? undefined,
    };

    const existente = await this.findClientePorTelefone(digitos);

    if (existente) {
      await this.repo.updateClienteComInteracao(
        existente.id,
        this.buildPreferenciasFaltantes(existente, dto),
        interacao,
      );
    } else {
      await this.repo.createClienteComInteracao(this.buildNovoCliente(dto, digitos), interacao);
    }

    return mapAlertaToResponse();
  }

  private async findClientePorTelefone(digitos: string): Promise<ClienteAlerta | null> {
    const candidatos = await this.repo.findClientesPorFinalTelefone(digitos.slice(-4));
    return candidatos.find((c) => c.telefone.replace(/\D/g, '') === digitos) ?? null;
  }

  private buildNovoCliente(dto: CreateAlertaImovelDto, digitos: string): Prisma.ClienteCreateInput {
    return {
      nome: dto.nome.trim(),
      telefone: this.formatarTelefone(digitos),
      email: dto.email,
      origem: ORIGEM_ALERTA,
      tipoDesejado: dto.tipoDesejado ?? [],
      finalidadeDesejada: dto.finalidadeDesejada,
      bairroDesejado: dto.bairroDesejado?.trim() || undefined,
      valorMax: dto.valorMax,
      quartosMin: dto.quartosMin,
    };
  }

  private buildPreferenciasFaltantes(
    cliente: ClienteAlerta,
    dto: CreateAlertaImovelDto,
  ): Prisma.ClienteUpdateInput {
    const data: Prisma.ClienteUpdateInput = {};

    if (!cliente.email && dto.email) {
      data.email = dto.email;
    }
    if (cliente.tipoDesejado.length === 0 && dto.tipoDesejado?.length) {
      data.tipoDesejado = dto.tipoDesejado;
    }
    if (!cliente.finalidadeDesejada && dto.finalidadeDesejada) {
      data.finalidadeDesejada = dto.finalidadeDesejada;
    }
    if (!cliente.bairroDesejado && dto.bairroDesejado?.trim()) {
      data.bairroDesejado = dto.bairroDesejado.trim();
    }
    if (cliente.valorMax === null && dto.valorMax !== undefined) {
      data.valorMax = dto.valorMax;
    }
    if (cliente.quartosMin === null && dto.quartosMin !== undefined) {
      data.quartosMin = dto.quartosMin;
    }

    return data;
  }

  private descreverPedido(dto: CreateAlertaImovelDto): string {
    const linhas: string[] = [];

    if (dto.tipoDesejado?.length) {
      linhas.push(`Procura: ${dto.tipoDesejado.map((t) => TIPO_LABELS[t]).join(', ')}`);
    }
    if (dto.finalidadeDesejada) {
      linhas.push(`Finalidade: ${FINALIDADE_LABELS[dto.finalidadeDesejada]}`);
    }
    if (dto.bairroDesejado?.trim()) {
      linhas.push(`Bairro: ${dto.bairroDesejado.trim()}`);
    }
    if (dto.valorMax !== undefined) {
      linhas.push(
        `Até ${dto.valorMax.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}`,
      );
    }
    if (dto.quartosMin !== undefined) {
      linhas.push(`A partir de ${dto.quartosMin} quarto(s)`);
    }
    if (dto.imovelCodigo) {
      linhas.push(`Estava vendo o imóvel ${dto.imovelCodigo}`);
    }
    if (dto.mensagem?.trim()) {
      linhas.push(`Mensagem: ${dto.mensagem.trim()}`);
    }

    return linhas.length > 0 ? linhas.join('\n') : 'Sem preferências informadas.';
  }

  private formatarTelefone(digitos: string): string {
    if (digitos.length === 11) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }
    if (digitos.length === 10) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return digitos;
  }
}
