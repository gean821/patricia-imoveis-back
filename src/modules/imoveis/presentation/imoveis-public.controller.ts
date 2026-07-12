import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImoveisService } from '../application/imoveis.service';
import { ListImoveisQueryDto } from './dto/imovel.dtos';
import {
  ImovelListItemResponseDto,
  ImovelResponseDto,
} from './dto/imovel-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('vitrine')
@Public()
@Controller('imoveis')
export class ImoveisPublicController {
  constructor(private readonly service: ImoveisService) {}

  @Get()
  async list(
    @Query() query: ListImoveisQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    return await this.service.listPublic(query);
  }

  @Get('destaques')
  async destaques(
    @Query() query: ListImoveisQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    return await this.service.listPublic({
      ...query,
      destaque: true,
      limit: query.limit ?? 6,
    });
  }

  @Get('lancamentos')
  async lancamentos(
    @Query() query: ListImoveisQueryDto,
  ): Promise<PaginatedResponseDto<ImovelListItemResponseDto>> {
    return await this.service.listPublic({
      ...query,
      finalidade: 'LANCAMENTO',
      limit: query.limit ?? 6,
    });
  }

  @Get(':codigo')
  async findByCodigo(@Param('codigo') codigo: string): Promise<ImovelResponseDto> {
    return await this.service.findByCodigoPublic(codigo);
  }
}
