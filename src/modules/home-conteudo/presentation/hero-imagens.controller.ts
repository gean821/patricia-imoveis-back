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
import { HeroImagensService } from '../application/hero-imagens.service';
import {
  CreateHeroImagemDto,
  ListHeroImagensQueryDto,
  ReordenarHeroImagensDto,
  UpdateHeroImagemDto,
} from './dto/hero-imagem.dtos';
import { HeroImagemResponseDto } from './dto/hero-imagem-response.dtos';
import { PaginatedResponseDto } from '../../../shared/dto/paginated-response.dto';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: home-conteudo')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/home-conteudo/hero-imagens')
export class HeroImagensController {
  constructor(private readonly service: HeroImagensService) { }

  @Post()
  async create(@Body() dto: CreateHeroImagemDto): Promise<HeroImagemResponseDto> {
    return await this.service.create(dto);
  }

  @Get()
  async list(
    @Query() query: ListHeroImagensQueryDto,
  ): Promise<PaginatedResponseDto<HeroImagemResponseDto>> {
    return await this.service.list(query);
  }

  @Patch('reordenar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reordenar(@Body() dto: ReordenarHeroImagensDto): Promise<void> {
    await this.service.reordenar(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHeroImagemDto,
  ): Promise<HeroImagemResponseDto> {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
