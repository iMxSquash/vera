import { Controller, Get, Query } from '@nestjs/common';
import { ContentsService } from '../services/contents.service';

@Controller('contents')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.contentsService.searchContents(q);
  }

  @Get('summary')
  async summary(@Query('text') text: string) {
    return this.contentsService.getSummary(text);
  }
}
