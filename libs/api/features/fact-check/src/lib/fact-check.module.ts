import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FactCheckService } from './fact-check.service';
import { FactCheckController } from './fact-check.controller';

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [FactCheckController],
  providers: [FactCheckService],
  exports: [FactCheckService],
})
export class FactCheckModule {}
