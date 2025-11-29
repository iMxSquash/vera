import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FaceSwapService } from './face-swap.service';
import { FaceSwapController } from './face-swap.controller';
import { ReferenceImageEntity } from './entities/reference-image.entity';
import { FaceSwapTaskEntity } from './entities/face-swap-task.entity';
import { SupabaseModule } from '@vera/api/shared/data-access';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReferenceImageEntity, FaceSwapTaskEntity]),
    HttpModule,
    SupabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'),
            false
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [FaceSwapController],
  providers: [FaceSwapService],
  exports: [FaceSwapService],
})
export class FaceSwapModule {}
