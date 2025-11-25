import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FactCheckService } from './fact-check.service';
import { CreateFactCheckDto, FactCheckResponseDto } from './dto';
import { JwtAuthGuard } from '@vera/api/shared/util';

@ApiTags('fact-check')
@Controller('fact-check')
export class FactCheckController {
  constructor(private readonly factCheckService: FactCheckService) {}

  /**
   * Create a new fact-check request
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new fact-check request',
    description: 'Submit a query to be verified by the Vera API',
  })
  @ApiResponse({
    status: 201,
    description: 'Fact-check created and verified successfully',
    type: FactCheckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error (Vera API failure)' })
  async create(@Body() createDto: CreateFactCheckDto): Promise<FactCheckResponseDto> {
    return this.factCheckService.verifyFact(createDto);
  }

  /**
   * Get all fact-checks (optionally filtered by user ID)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get all fact-checks',
    description: 'Retrieve the history of fact-checks (optionally filtered by userId)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of fact-checks retrieved successfully',
    type: [FactCheckResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAll(): Promise<FactCheckResponseDto[]> {
    return this.factCheckService.getAllFactChecks();
  }

  /**
   * Get a specific fact-check by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get a specific fact-check',
    description: 'Retrieve details of a fact-check by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Fact-check retrieved successfully',
    type: FactCheckResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid fact-check ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getById(@Param('id') id: string): Promise<FactCheckResponseDto> {
    return this.factCheckService.getFactCheckById(id);
  }
}
