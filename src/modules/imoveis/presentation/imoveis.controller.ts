import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ImoveisService } from '../application/imoveis.service';
import { CreateImovelDto, ListImoveisQueryDto, UpdateImovelDto } from './dto/imovel.dtos';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: imoveis')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/imoveis')
export class ImoveisController {
  constructor(private readonly service: ImoveisService) { }

  @Post()
  create(@Body() dto: CreateImovelDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: ListImoveisQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateImovelDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}