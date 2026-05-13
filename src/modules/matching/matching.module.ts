import { Module } from '@nestjs/common';
import { MatchingController } from './presentation/matching.controller';
import { MatchingService } from './application/matching.service';

@Module({
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}