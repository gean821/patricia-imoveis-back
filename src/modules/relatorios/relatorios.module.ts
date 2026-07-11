import { Module } from '@nestjs/common';
import { RelatoriosController } from './presentation/relatorios.controller';
import { RelatoriosService } from './application/relatorios.service';
import { RelatoriosRepository } from './repository/relatorios.repository';

@Module({
  controllers: [RelatoriosController],
  providers: [RelatoriosService, RelatoriosRepository],
  exports: [RelatoriosService],
})
export class RelatoriosModule {}
