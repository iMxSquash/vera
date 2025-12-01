import { Controller, Get, Param } from '@nestjs/common';
import { SurveyService } from './survey.service';

@Controller('survey')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Get('all')
  getAllSurveys() {
    return this.surveyService.findAllSurveys();
  }

  // Importer les réponses depuis un Google Sheet en BDD
  // GET /api/survey/import/:sheetId
   @Get('import/:sheetId')
  import(@Param('sheetId') sheetId: string) {
    return this.surveyService.importFromGoogleSheet(sheetId);
  }

  @Get('cleanup')
cleanup() {
  return this.surveyService.cleanup();
}

  @Get(':sheetId/stats')
  getStats(@Param('sheetId') sheetId: string) {
    return this.surveyService.getStats(sheetId);
  }

  // Récupérer les réponses d’un sondage particulier
  // GET /api/survey/:sheetId
  @Get(':sheetId')
  findBySheet(@Param('sheetId') sheetId: string) {
    return this.surveyService.findBySheet(sheetId);
  }

  

  
}
