import { BadRequestException, Injectable } from '@nestjs/common';
import { PeriodoRange, RelatoriosRepository } from '../repository/relatorios.repository';
import { DashboardQueryDto, PeriodoRelatorio } from '../presentation/dto/relatorios.dtos';
import { DashboardResponseDto } from '../presentation/dto/relatorios-response.dtos';
import { mapDashboard } from './relatorios.mapper';

@Injectable()
export class RelatoriosService {
  constructor(private readonly repo: RelatoriosRepository) {}

  async dashboard(query: DashboardQueryDto): Promise<DashboardResponseDto> {
    const range = this.calcularPeriodo(query);

    const [clientes, interacoes, statusImoveis] = await Promise.all([
      this.repo.clientesNoPeriodo(range),
      this.repo.interacoesNoPeriodo(range),
      this.repo.statusImoveis(),
    ]);

    return mapDashboard(range, clientes, interacoes, statusImoveis);
  }

  private calcularPeriodo(query: DashboardQueryDto): PeriodoRange {
    const agora = new Date();
    const inicioDoDia = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const fimDoDia = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    switch (query.periodo) {
      case PeriodoRelatorio.SETE_DIAS: {
        const inicio = new Date(agora);
        inicio.setDate(inicio.getDate() - 6);
        return { inicio: inicioDoDia(inicio), fim: fimDoDia(agora) };
      }
      case PeriodoRelatorio.TRINTA_DIAS: {
        const inicio = new Date(agora);
        inicio.setDate(inicio.getDate() - 29);
        return { inicio: inicioDoDia(inicio), fim: fimDoDia(agora) };
      }
      case PeriodoRelatorio.MES_ATUAL: {
        const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        return { inicio: inicioDoDia(inicio), fim: fimDoDia(agora) };
      }
      case PeriodoRelatorio.DOZE_MESES: {
        const inicio = new Date(agora.getFullYear(), agora.getMonth() - 11, 1);
        return { inicio: inicioDoDia(inicio), fim: fimDoDia(agora) };
      }
      case PeriodoRelatorio.PERSONALIZADO: {
        if (!query.dataInicio || !query.dataFim) {
          throw new BadRequestException(
            'dataInicio e dataFim são obrigatórios para período personalizado',
          );
        }
        const inicio = new Date(query.dataInicio);
        const fim = new Date(query.dataFim);
        if (inicio > fim) {
          throw new BadRequestException('dataInicio não pode ser depois de dataFim');
        }
        return { inicio: inicioDoDia(inicio), fim: fimDoDia(fim) };
      }
      default:
        throw new BadRequestException('Período inválido');
    }
  }
}
