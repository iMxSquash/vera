import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { FactCheckService } from './services/fact-check.service';
import { FactCheckController } from './controllers/fact-check.controller';

import { FactCheckEntity, ImageEntity } from './entities/fact-check.entity';
import { FactCheckRepository } from './repositories/fact-check.repository';

import { SupabaseModule } from '@vera/api/shared/data-access';
import { SearchService } from './services/search.service';
import { ClaimExtractorService } from './services/claim-extractor.service';
import { MediaAnalyzerService } from './services/media-analyzer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FactCheckEntity, ImageEntity]),
    HttpModule,
    SupabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (
          !file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|avi|mov|webm)$/) &&
          !file.mimetype.startsWith('audio/')
        ) {
          return callback(new Error('Only image, video and audio files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [FactCheckController],
  providers: [
    FactCheckService,
    FactCheckRepository,
    SearchService,
    ClaimExtractorService,
    MediaAnalyzerService,
  ],
  exports: [FactCheckService, FactCheckRepository],
})
export class FactCheckModule {}
