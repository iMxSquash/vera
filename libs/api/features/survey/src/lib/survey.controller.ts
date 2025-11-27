import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  async create(@Body() body: CreateSurveyDto) {
    // Vérification du secret
    /*if (body.secret !== process.env.FORM_SECRET) {
      throw new HttpException('Unauthorized request', HttpStatus.UNAUTHORIZED);
    }

    delete body.secret;*/
    return this.surveyService.create(body);
  }

  @Get()
  async findAll() {
    return this.surveyService.findAll();
  }
}
