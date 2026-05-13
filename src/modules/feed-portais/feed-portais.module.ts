import { Module } from '@nestjs/common';
import { FeedPortaisController } from './presentation/feed-portais.controller';
import { FeedPortaisService } from './application/feed-portais.service';
import { ImoveisModule } from '../imoveis/imoveis.module';

@Module({
  imports: [ImoveisModule],
  controllers: [FeedPortaisController],
  providers: [FeedPortaisService],
})
export class FeedPortaisModule {}