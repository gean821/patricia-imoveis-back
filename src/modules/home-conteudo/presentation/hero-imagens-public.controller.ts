import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeroImagensService } from '../application/hero-imagens.service';
import { HeroImagemResponseDto } from './dto/hero-imagem-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('vitrine')
@Public()
@Controller('home-conteudo/hero-imagens')
export class HeroImagensPublicController {
  constructor(private readonly service: HeroImagensService) {}

  @Get()
  async list(): Promise<PaginatedResponseDto<HeroImagemResponseDto>> {
    return await this.service.listPublic();
  }
}
