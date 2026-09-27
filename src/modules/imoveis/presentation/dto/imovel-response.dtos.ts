import { Finalidade, StatusImovel, TipoImovel } from '@prisma/client';

export class ImovelFotoResponseDto {
  id: string;
  url: string;
  storageKey: string;
  legenda: string | null;
  ordem: number;
  isCapa: boolean;
}

export class ImovelVideoResponseDto {
  id: string;
  url: string;
  storageKey: string;
  capaUrl: string | null;
  capaStorageKey: string | null;
  ordem: number;
}

export class ImovelResponseDto {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoImovel;
  finalidade: Finalidade;
  status: StatusImovel;
  destaque: boolean;

  endereco: string;
  numero: string | null;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;

  valor: number;
  valorCondominio: number | null;
  valorIptu: number | null;

  area: number;
  areaTotal: number | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  anoConstrucao: number | null;
  mobiliado: boolean;

  caracteristicas: string[];

  fotos: ImovelFotoResponseDto[];
  videos: ImovelVideoResponseDto[];
  videoUrl: string | null;
  plantaUrl: string | null;
  tourVirtualUrl: string | null;

  publicadoFeed: boolean;
  publicadoOlx: boolean;
  publicadoChavesNaMao: boolean;
  publicadoSub100: boolean;
  publicadoZap: boolean;
  publicadoVivaReal: boolean;

  totalClientesInteressados: number;
  totalInteracoes: number;

  createdAt: Date;
  updatedAt: Date;
}

export class ImovelListItemResponseDto {
  id: string;
  codigo: string;
  titulo: string;
  tipo: TipoImovel;
  finalidade: Finalidade;
  status: StatusImovel;
  destaque: boolean;

  bairro: string;
  cidade: string;
  estado: string;

  valor: number;
  area: number;
  quartos: number | null;
  banheiros: number | null;
  suites: number | null;
  vagas: number | null;

  fotoCapa: string | null;
  fotoCapaLegenda: string | null;

  createdAt: Date;
}
