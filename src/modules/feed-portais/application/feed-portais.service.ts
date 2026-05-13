import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { create } from 'xmlbuilder2';
import { Finalidade, TipoImovel } from '@prisma/client';
import { ImoveisRepository, ImovelDetailed } from '../../imoveis/repository/imoveis.repository';

const TIPO_MAP: Record<TipoImovel, string> = {
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  SOBRADO: 'Sobrado',
  COBERTURA: 'Cobertura',
  KITNET: 'Kitnet',
  STUDIO: 'Studio',
  TERRENO: 'Terreno',
  CHACARA: 'Chácara',
  SITIO: 'Sítio',
  FAZENDA: 'Fazenda',
  COMERCIAL: 'Sala Comercial',
  GALPAO: 'Galpão',
  SALA: 'Sala',
};

@Injectable()
export class FeedPortaisService {
  constructor(
    private readonly imoveisRepo: ImoveisRepository,
    private readonly config: ConfigService,
  ) { }

  /**
   * Feed no padrão "Imovel Web" / GrupoZAP / VivaReal — formato XML genérico
   * suportado pela maioria dos portais brasileiros (OLX, ZAP, VivaReal, ChavesNaMão).
   * Portais consomem este endpoint via crawler agendado deles.
   */
  async generateXml(): Promise<string> {
    const imoveis = await this.imoveisRepo.findAllForFeed();
    const siteUrl = this.config.get<string>('publicSiteUrl') ?? '';

    const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('ListingDataFeed', {
      xmlns: 'http://www.vivareal.com/schemas/1.0/VRSync.xsd',
    });

    root.ele('Header')
      .ele('Provider').txt('Patricia Imóveis').up()
      .ele('Email').txt('').up()
      .ele('PublishDate').txt(new Date().toISOString()).up();

    const listings = root.ele('Listings');

    for (const imovel of imoveis) {
      this.buildListing(listings, imovel, siteUrl);
    }

    return root.end({ prettyPrint: true });
  }

  private buildListing(parent: any, im: ImovelDetailed, siteUrl: string): void {
    const node = parent.ele('Listing');

    node.ele('ListingID').txt(im.codigo).up();
    node.ele('Title').txt(im.titulo).up();
    if (im.descricao) node.ele('Description').dat(im.descricao).up();

    const transactionType = this.finalidadeToTransaction(im.finalidade);
    node.ele('TransactionType').txt(transactionType).up();

    const details = node.ele('Details');
    details.ele('PropertyType').txt(TIPO_MAP[im.tipo]).up();
    if (im.quartos !== null && im.quartos !== undefined) details.ele('Bedrooms').txt(String(im.quartos)).up();
    if (im.banheiros !== null && im.banheiros !== undefined) details.ele('Bathrooms').txt(String(im.banheiros)).up();
    if (im.suites !== null && im.suites !== undefined) details.ele('Suites').txt(String(im.suites)).up();
    if (im.vagas !== null && im.vagas !== undefined) details.ele('Garage').txt(String(im.vagas)).up();
    details.ele('LivingArea', { unit: 'square metres' }).txt(String(im.area)).up();
    if (im.areaTotal) details.ele('LotArea', { unit: 'square metres' }).txt(String(im.areaTotal)).up();
    if (im.anoConstrucao) details.ele('YearBuilt').txt(String(im.anoConstrucao)).up();

    const prices = details.ele('ListPrice', { currency: 'BRL' }).txt(String(im.valor)).up();
    if (im.valorCondominio) {
      details.ele('PropertyAdministrationFee', { currency: 'BRL' }).txt(String(im.valorCondominio)).up();
    }
    if (im.valorIptu) {
      details.ele('YearlyTax', { currency: 'BRL' }).txt(String(im.valorIptu)).up();
    }

    if (im.caracteristicas?.length) {
      const features = details.ele('Features');
      for (const f of im.caracteristicas) features.ele('Feature').txt(f).up();
    }

    if (im.fotos?.length) {
      const media = details.ele('Media');
      for (const foto of im.fotos) {
        media.ele('Item', { medium: 'image', caption: foto.legenda ?? '' }).txt(foto.url).up();
      }
      if (im.videoUrl) media.ele('Item', { medium: 'video' }).txt(im.videoUrl).up();
    }

    const location = node.ele('Location', { displayAddress: 'Neighborhood' });
    location.ele('Country', { abbreviation: 'BR' }).txt('Brasil').up();
    location.ele('State', { abbreviation: im.estado }).txt(im.estado).up();
    location.ele('City').txt(im.cidade).up();
    location.ele('Neighborhood').txt(im.bairro).up();
    location.ele('Address').txt(`${im.endereco}${im.numero ? ', ' + im.numero : ''}`).up();
    if (im.cep) location.ele('PostalCode').txt(im.cep).up();
    if (im.latitude && im.longitude) {
      location.ele('Latitude').txt(String(im.latitude)).up();
      location.ele('Longitude').txt(String(im.longitude)).up();
    }

    if (siteUrl) {
      node.ele('DetailViewUrl').txt(`${siteUrl.replace(/\/$/, '')}/imovel/${im.codigo}`).up();
    }
  }

  private finalidadeToTransaction(f: Finalidade): string {
    switch (f) {
      case 'VENDA':
        return 'For Sale';
      case 'ALUGUEL':
        return 'For Rent';
      case 'AMBOS':
        return 'For Sale/Rent';
    }
  }
}