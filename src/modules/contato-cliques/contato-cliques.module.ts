import { Module } from '@nestjs/common';
import { ContatoCliquesPublicController } from './presentation/contato-cliques-public.controller';
import { ContatoCliquesService } from './application/contato-cliques.service';
import { ContatoCliquesRepository } from './repository/contato-cliques.repository';

@Module({
  controllers: [ContatoCliquesPublicController],
  providers: [ContatoCliquesService, ContatoCliquesRepository],
})
export class ContatoCliquesModule {}
