import { Module } from '@nestjs/common';
import { HeroImagensController } from './presentation/hero-imagens.controller';
import { HeroImagensPublicController } from './presentation/hero-imagens-public.controller';
import { VideosDestaqueController } from './presentation/videos-destaque.controller';
import { VideosDestaquePublicController } from './presentation/videos-destaque-public.controller';
import { HeroImagensService } from './application/hero-imagens.service';
import { VideosDestaqueService } from './application/videos-destaque.service';
import { HeroImagensRepository } from './repository/hero-imagens.repository';
import { VideosDestaqueRepository } from './repository/videos-destaque.repository';

@Module({
  controllers: [
    HeroImagensController,
    HeroImagensPublicController,
    VideosDestaqueController,
    VideosDestaquePublicController,
  ],
  providers: [HeroImagensService, VideosDestaqueService, HeroImagensRepository, VideosDestaqueRepository],
})
export class HomeConteudoModule { }
