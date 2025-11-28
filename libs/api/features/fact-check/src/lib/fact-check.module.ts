import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FactCheckService } from './fact-check.service';
import { FactCheckController } from './fact-check.controller';
import { ImageEntity } from './entities/fact-check.entity';
import { SupabaseModule } from '@vera/api/shared/data-access';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),
    HttpModule,
    SupabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|avi|mov|webm)$/)) {
          return callback(new Error('Only image and video files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB pour les vidéos
      },
    }),
  ],
  controllers: [FactCheckController],
  providers: [FactCheckService],
  exports: [FactCheckService],
})
export class FactCheckModule {}