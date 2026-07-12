import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VideosDestaqueService } from '../application/videos-destaque.service';
import { VideoDestaqueResponseDto } from './dto/video-destaque-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('vitrine')
@Public()
@Controller('home-conteudo/videos-destaque')
export class VideosDestaquePublicController {
  constructor(private readonly service: VideosDestaqueService) { }

  @Get()
  async list(): Promise<PaginatedResponseDto<VideoDestaqueResponseDto>> {
    return await this.service.listPublic();
  }
}
