import { InteracaoDetailed } from '../repository/interacoes.repository';
import { InteracaoResponseDto } from '../presentation/dto/interacao-response.dtos';

export function mapInteracaoToResponse(interacao: InteracaoDetailed): InteracaoResponseDto {
  return {
    id: interacao.id,
    clienteId: interacao.clienteId,
    imovelId: interacao.imovelId,
    tipo: interacao.tipo,
    titulo: interacao.titulo,
    descricao: interacao.descricao,
    data: interacao.data,
    createdAt: interacao.createdAt,
    cliente: {
      id: interacao.cliente.id,
      nome: interacao.cliente.nome,
      telefone: interacao.cliente.telefone,
    },
    imovel: interacao.imovel
      ? {
          id: interacao.imovel.id,
          codigo: interacao.imovel.codigo,
          titulo: interacao.imovel.titulo,
        }
      : null,
  };
}
