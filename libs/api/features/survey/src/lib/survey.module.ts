import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Survey } from './entities/survey.entity';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';
import { GoogleSheetsService } from './google-sheets/google-sheets.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Survey]),
  ],
  controllers: [SurveyController],
  providers: [SurveyService, GoogleSheetsService],
})
export class SurveyModule {}
