import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UploadsService } from '../application/uploads.service';
import { DeleteFileDto, PresignUploadDto, PresignUploadResponseDto } from './dto/upload.dtos';
import { RequireRoles } from '../../../shared/auth/decorators/roles.decorator';

@ApiTags('admin: uploads')
@ApiBearerAuth()
@RequireRoles(Role.ADMIN, Role.CORRETOR)
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly service: UploadsService) { }

  @Post('presign')
  async presign(@Body() dto: PresignUploadDto): Promise<PresignUploadResponseDto> {
    return await this.service.presign(dto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFile(@Body() dto: DeleteFileDto): Promise<void> {
    await this.service.delete(dto.key);
  }
}