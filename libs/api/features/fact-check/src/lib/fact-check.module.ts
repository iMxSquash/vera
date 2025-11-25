import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FactCheckService } from './fact-check.service';
import { FactCheckController } from './fact-check.controller';
import { FactCheckEntity } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([FactCheckEntity]), HttpModule],
  controllers: [FactCheckController],
  providers: [FactCheckService],
  exports: [FactCheckService], // Export for use in other modules
})
export class FactCheckModule {}
