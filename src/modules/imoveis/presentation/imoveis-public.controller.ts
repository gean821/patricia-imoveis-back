import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImoveisService } from '../application/imoveis.service';
import { ListImoveisQueryDto } from './dto/imovel.dtos';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('vitrine')
@Public()
@Controller('imoveis')
export class ImoveisPublicController {
  constructor(private readonly service: ImoveisService) {}

  @Get()
  list(@Query() query: ListImoveisQueryDto) {
    return this.service.listPublic(query);
  }

  @Get('destaques')
  destaques(@Query() query: ListImoveisQueryDto) {
    return this.service.listPublic({ ...query, destaque: true, limit: query.limit ?? 6 });
  }

  @Get(':codigo')
  async findByCodigo(@Param('codigo') codigo: string) {
    const imovel = await this.service.findByCodigo(codigo);
    if (imovel.status !== 'DISPONIVEL' && imovel.status !== 'RESERVADO' && imovel.status !== 'NEGOCIACAO') {
      throw new NotFoundException();
    }
    return imovel;
  }
}