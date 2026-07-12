import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UploadsService } from '../application/uploads.service';
import { DeleteFileDto, UploadFileResponseDto } from './dto/upload.dtos';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: uploads')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly service: UploadsService) { }

  @Post('imoveis/:imovelId/foto')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFoto(
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return await this.service.uploadFotoImovel(imovelId, file);
  }

  @Post('imoveis/:imovelId/video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return await this.service.uploadVideoImovel(imovelId, file);
  }

  @Post('imoveis/:imovelId/planta')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlanta(
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return await this.service.uploadPlantaImovel(imovelId, file);
  }

  @Post('home/hero-imagem')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadHeroImagem(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return await this.service.uploadHeroImagem(file);
  }

  @Post('home/video-destaque')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideoDestaque(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return await this.service.uploadVideoDestaque(file);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Body() dto: DeleteFileDto): Promise<void> {
    await this.service.delete(dto.key);
  }
}