import { Module } from '@nestjs/common';
import { ClientesController } from './presentation/clientes.controller';
import { ClientesService } from './application/clientes.service';
import { ClientesRepository } from './repository/clientes.repository';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService, ClientesRepository],
  exports: [ClientesService, ClientesRepository],
})
export class ClientesModule {}