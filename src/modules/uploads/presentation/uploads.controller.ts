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
import { IsNotEmpty, IsString } from 'class-validator';
import { UploadsService } from '../application/uploads.service';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

class DeleteFileDto {
  @IsString()
  @IsNotEmpty()
  key: string;
}

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
  ) {
    return await this.service.uploadFotoImovel(imovelId, file);
  }

  @Post('imoveis/:imovelId/video')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadVideoImovel(imovelId, file);
  }

  @Post('imoveis/:imovelId/planta')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadPlanta(
    @Param('imovelId', ParseUUIDPipe) imovelId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadPlantaImovel(imovelId, file);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Body() dto: DeleteFileDto): Promise<void> {
    await this.service.delete(dto.key);
  }
}