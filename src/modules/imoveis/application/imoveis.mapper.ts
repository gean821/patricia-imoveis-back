import { ImovelDetailed, ImovelListItem } from '../repository/imoveis.repository';
import {
  ImovelFotoResponseDto,
  ImovelListItemResponseDto,
  ImovelResponseDto,
} from '../presentation/dto/imovel-response.dtos';

function decimalToNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value.toString());
}

function decimalToNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value.toString());
}

function mapFoto(foto: ImovelDetailed['fotos'][number]): ImovelFotoResponseDto {
  return {
    id: foto.id,
    url: foto.url,
    storageKey: foto.storageKey,
    legenda: foto.legenda,
    ordem: foto.ordem,
    isCapa: foto.isCapa,
  };
}

export function mapImovelToResponse(imovel: ImovelDetailed): ImovelResponseDto {
  return {
    id: imovel.id,
    codigo: imovel.codigo,
    titulo: imovel.titulo,
    descricao: imovel.descricao,
    tipo: imovel.tipo,
    finalidade: imovel.finalidade,
    status: imovel.status,
    destaque: imovel.destaque,
    isLancamento: imovel.isLancamento,

    endereco: imovel.endereco,
    numero: imovel.numero,
    complemento: imovel.complemento,
    bairro: imovel.bairro,
    cidade: imovel.cidade,
    estado: imovel.estado,
    cep: imovel.cep,
    latitude: imovel.latitude,
    longitude: imovel.longitude,

    valor: decimalToNumber(imovel.valor),
    valorCondominio: decimalToNumberOrNull(imovel.valorCondominio),
    valorIptu: decimalToNumberOrNull(imovel.valorIptu),

    area: imovel.area,
    areaTotal: imovel.areaTotal,
    quartos: imovel.quartos,
    suites: imovel.suites,
    banheiros: imovel.banheiros,
    vagas: imovel.vagas,
    anoConstrucao: imovel.anoConstrucao,
    mobiliado: imovel.mobiliado,

    caracteristicas: imovel.caracteristicas,

    fotos: imovel.fotos.map(mapFoto),
    videoUrl: imovel.videoUrl,
    plantaUrl: imovel.plantaUrl,
    tourVirtualUrl: imovel.tourVirtualUrl,

    publicadoFeed: imovel.publicadoFeed,
    publicadoOlx: imovel.publicadoOlx,
    publicadoChavesNaMao: imovel.publicadoChavesNaMao,
    publicadoSub100: imovel.publicadoSub100,
    publicadoZap: imovel.publicadoZap,
    publicadoVivaReal: imovel.publicadoVivaReal,

    totalClientesInteressados: imovel._count.clientesInteressados,
    totalInteracoes: imovel._count.interacoes,

    createdAt: imovel.createdAt,
    updatedAt: imovel.updatedAt,
  };
}

export function mapImovelToListItem(imovel: ImovelListItem): ImovelListItemResponseDto {
  const capa = imovel.fotos[0] ?? null;
  return {
    id: imovel.id,
    codigo: imovel.codigo,
    titulo: imovel.titulo,
    tipo: imovel.tipo,
    finalidade: imovel.finalidade,
    status: imovel.status,
    destaque: imovel.destaque,
    isLancamento: imovel.isLancamento,
    bairro: imovel.bairro,
    cidade: imovel.cidade,
    estado: imovel.estado,
    valor: decimalToNumber(imovel.valor),
    area: imovel.area,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    suites: imovel.suites,
    vagas: imovel.vagas,
    fotoCapa: capa?.url ?? null,
    fotoCapaLegenda: capa?.legenda ?? null,
    createdAt: imovel.createdAt,
  };
}
