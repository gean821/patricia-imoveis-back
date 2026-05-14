import { Module } from '@nestjs/common';
import { MatchingController } from './presentation/matching.controller';
import { MatchingService } from './application/matching.service';
import { MatchingRepository } from './repository/matching.repository';

@Module({
  controllers: [MatchingController],
  providers: [MatchingService, MatchingRepository],
})
export class MatchingModule {}
