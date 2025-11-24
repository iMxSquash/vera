import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { AppService } from './app.service';

@ApiTags('general')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: "Vérifier la santé de l'API" })
  @ApiResponse({
    status: 200,
    description: 'API fonctionnelle',
    schema: {
      example: { message: 'Hello API' },
    },
  })
  getData() {
    return this.appService.getData();
  }
}
