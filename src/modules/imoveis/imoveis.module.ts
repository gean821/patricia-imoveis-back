import { Module } from '@nestjs/common';
import { ImoveisController } from './presentation/imoveis.controller';
import { ImoveisPublicController } from './presentation/imoveis-public.controller';
import { ImoveisService } from './application/imoveis.service';
import { ImoveisRepository } from './repository/imoveis.repository';

@Module({
  controllers: [ImoveisController, ImoveisPublicController],
  providers: [ImoveisService, ImoveisRepository],
  exports: [ImoveisService, ImoveisRepository],
})
export class ImoveisModule {}