import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FactCheckService } from './fact-check.service';
import { CreateFactCheckDto } from './dto/create-fact-check.dto';
import { JwtAuthGuard } from '@vera/api/features/auth';

@ApiTags('Fact Check')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fact-check')
export class FactCheckController {
  constructor(private readonly factCheckService: FactCheckService) {}

  @Post()
  @ApiOperation({ summary: 'Verify a fact (Streaming response)' })
  @ApiResponse({ status: 201, description: 'Stream started' })
  async verify(@Body() createFactCheckDto: CreateFactCheckDto, @Res() res: Response) {
    const stream = await this.factCheckService.verifyFactStream(
      createFactCheckDto.userId,
      createFactCheckDto.query
    );
    
    res.set({
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    });

    stream.pipe(res);
  }

  @Get()
  @ApiOperation({ summary: 'Get fact check history' })
  @ApiResponse({ status: 200, description: 'List of fact checks' })
  async findAll() {
    return this.factCheckService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fact check details' })
  @ApiResponse({ status: 200, description: 'Fact check details' })
  @ApiResponse({ status: 404, description: 'Fact check not found' })
  async findOne(@Param('id') id: string) {
    const factCheck = await this.factCheckService.findOne(id);
    if (!factCheck) {
      throw new NotFoundException(`Fact check with ID ${id} not found`);
    }
    return factCheck;
  }
}
