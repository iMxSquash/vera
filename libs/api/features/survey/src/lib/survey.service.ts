import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
  ) {}

  async create(data: CreateSurveyDto) {
    const newSurvey = this.surveyRepository.create({
      q1: data.q1,
      created_at: data.created_at ? new Date(data.created_at) : undefined,
    });

    return this.surveyRepository.save(newSurvey);
  }

  async findAll() {
    return this.surveyRepository.find({
      order: { created_at: 'DESC' },
    });
  }
}
