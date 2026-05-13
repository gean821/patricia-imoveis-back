import { Module } from '@nestjs/common';
import { UploadsController } from './presentation/uploads.controller';
import { UploadsService } from './application/uploads.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
})

export class UploadsModule {}