import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContatoCliquesService } from '../application/contato-cliques.service';
import { CreateContatoCliqueDto } from './dto/contato-clique.dtos';
import { ContatoCliqueResponseDto } from './dto/contato-clique-response.dtos';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('vitrine')
@Public()
@Controller('contato-cliques')
export class ContatoCliquesPublicController {
  constructor(private readonly service: ContatoCliquesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContatoCliqueDto): Promise<ContatoCliqueResponseDto> {
    return await this.service.registrar(dto);
  }
}
