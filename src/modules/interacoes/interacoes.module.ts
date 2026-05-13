import { Module } from '@nestjs/common';
import { InteracoesController } from './presentation/interacoes.controller';
import { InteracoesService } from './application/interacoes.service';
import { InteracoesRepository } from './repository/interacoes.repository';

@Module({
  controllers: [InteracoesController],
  providers: [InteracoesService, InteracoesRepository],
  exports: [InteracoesService],
})
export class InteracoesModule {}