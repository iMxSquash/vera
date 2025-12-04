import { Module } from '@nestjs/common';
import { ContentsService } from '../services/contents.service';
import { ContentsController } from '../controllers/contents.controller';

@Module({
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService], // <-- important pour Telegram Bot & autres modules
})
export class ContentsModule {}
