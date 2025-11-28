import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FactCheckService } from './fact-check.service';
import { VerifyExternalFactDto } from './dto/verify-external-fact.dto';
import { JwtAuthGuard } from '@vera/api/features/auth';

@ApiTags('Fact Check')
@Controller('fact-check')
export class FactCheckController {
  constructor(private readonly factCheckService: FactCheckService) {}

  @Post('verify-external')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify a fact from external API (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'API call failed' })
  async verifyExternal(@Body() dto: VerifyExternalFactDto) {
    return this.factCheckService.verifyFactExternal(dto.userId, dto.query);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify a fact (Streaming response)' })
  @ApiResponse({ status: 201, description: 'Stream started' })
  async verify(@Body() dto: VerifyExternalFactDto, @Res() res: Response) {
    const stream = await this.factCheckService.verifyFactStream(
      dto.userId,
      dto.query
    );
    
    res.set({
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    });

    stream.pipe(res);
  }
}

