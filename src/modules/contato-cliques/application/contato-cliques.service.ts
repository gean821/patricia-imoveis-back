import { Injectable } from '@nestjs/common';
import { ContatoCliquesRepository } from '../repository/contato-cliques.repository';
import { CreateContatoCliqueDto } from '../presentation/dto/contato-clique.dtos';
import { ContatoCliqueResponseDto } from '../presentation/dto/contato-clique-response.dtos';
import { mapContatoCliqueToResponse } from './contato-cliques.mapper';

@Injectable()
export class ContatoCliquesService {
  constructor(private readonly repo: ContatoCliquesRepository) { }

  async registrar(dto: CreateContatoCliqueDto): Promise<ContatoCliqueResponseDto> {
    const imovelId = dto.imovelCodigo
      ? await this.repo.findImovelIdPorCodigo(dto.imovelCodigo)
      : null;

    await this.repo.create({
      tipo: dto.tipo,
      origem: dto.origem,
      imovel: imovelId ? { connect: { id: imovelId } } : undefined,
    });

    return mapContatoCliqueToResponse();
  }
}
