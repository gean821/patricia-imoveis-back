import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FeedPortaisService } from '../application/feed-portais.service';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('feed-portais')
@Public()
@Controller('feed')
export class FeedPortaisController {
  constructor(private readonly service: FeedPortaisService) { }

  @Get('imoveis.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=300')
  generateXml(): Promise<string> {
    return this.service.generateXml();
  }
}