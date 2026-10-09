import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlertasService } from '../application/alertas.service';
import { CreateAlertaImovelDto } from './dto/alerta.dtos';
import { AlertaImovelResponseDto } from './dto/alerta-response.dtos';
import { Public } from '../../../shared/auth/decorators/public.decorator';

@ApiTags('vitrine')
@Public()
@Controller('alertas')
export class AlertasPublicController {
  constructor(private readonly service: AlertasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAlertaImovelDto): Promise<AlertaImovelResponseDto> {
    return await this.service.registrar(dto);
  }
}
