import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FactCheckEntity } from './entities';
import { CreateFactCheckDto, FactCheckResponseDto } from './dto';

interface VeraError {
  response?: {
    status: number;
  };
  code?: string;
  message?: string;
}

@Injectable()
export class FactCheckService {
  private readonly veraApiUrl: string;
  private readonly veraApiKey: string;

  constructor(
    @InjectRepository(FactCheckEntity)
    private readonly factCheckRepository: Repository<FactCheckEntity>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.veraApiUrl = this.configService.get<string>('VERA_API_URL') || 'https://api.vera.app';
    this.veraApiKey = this.configService.get<string>('VERA_API_KEY') || '';

    if (!this.veraApiKey) {
      throw new Error('VERA_API_KEY environment variable is not set');
    }
  }

  /**
   * Verify a fact by querying the Vera API
   * @param createDto - Contains userId and query
   * @returns FactCheckResponseDto with the result
   */
  async verifyFact(createDto: CreateFactCheckDto): Promise<FactCheckResponseDto> {
    if (!createDto.query || createDto.query.trim().length === 0) {
      throw new BadRequestException('Query cannot be empty');
    }

    // Create a pending fact-check record
    const factCheckData: Partial<FactCheckEntity> = {
      userId: createDto.userId,
      query: createDto.query.trim(),
      status: 'pending',
    };
    const factCheck = this.factCheckRepository.create(factCheckData);

    await this.factCheckRepository.save(factCheck);

    try {
      // Call Vera API to verify the fact
      const veraResponse = await this.callVeraApi(createDto.query);

      // Update the fact-check with the response
      factCheck.response = veraResponse;
      factCheck.status = 'completed';
      await this.factCheckRepository.save(factCheck);

      return this.mapToResponseDto(factCheck);
    } catch (err: unknown) {
      // Mark as failed and re-throw
      const error = err as VeraError;
      factCheck.status = 'failed';
      factCheck.response = `Error: ${error?.message || 'Unknown error'}`;
      await this.factCheckRepository.save(factCheck);

      throw new InternalServerErrorException('Failed to verify fact with Vera API');
    }
  }

  /**
   * Auto-verify content (used by bots)
   * @param contentId - The content to verify
   * @param query - The text to verify
   * @returns FactCheckResponseDto
   */
  async autoVerify(userId: string, query: string): Promise<FactCheckResponseDto> {
    const createDto: CreateFactCheckDto = { userId, query };
    return this.verifyFact(createDto);
  }

  /**
   * Get all fact-checks (with optional filtering)
   * @param userId - Optional: filter by user ID
   * @returns Array of FactCheckResponseDto
   */
  async getAllFactChecks(userId?: string): Promise<FactCheckResponseDto[]> {
    let query = this.factCheckRepository.createQueryBuilder('factCheck');

    if (userId) {
      query = query.where('factCheck.userId = :userId', { userId });
    }

    const factChecks = await query.orderBy('factCheck.createdAt', 'DESC').getMany();

    return factChecks.map((fc) => this.mapToResponseDto(fc));
  }

  /**
   * Get a specific fact-check by ID
   * @param id - Fact-check ID
   * @returns FactCheckResponseDto
   */
  async getFactCheckById(id: string): Promise<FactCheckResponseDto> {
    const factCheck = await this.factCheckRepository.findOne({ where: { id } });

    if (!factCheck) {
      throw new BadRequestException(`Fact-check with ID ${id} not found`);
    }

    return this.mapToResponseDto(factCheck);
  }

  /**
   * Call the Vera API to verify a fact
   * @param query - The query to verify
   * @returns The response from Vera API
   */
  private async callVeraApi(query: string): Promise<string> {
    const url = `${this.veraApiUrl}/verify`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { query },
          {
            headers: {
              'Authorization': `Bearer ${this.veraApiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout
          },
        ),
      );

      // Extract the response text from Vera API
      const veraData = response.data;

      if (typeof veraData === 'string') {
        return veraData;
      } else if (veraData.result) {
        return veraData.result;
      } else if (veraData.text) {
        return veraData.text;
      } else {
        return JSON.stringify(veraData);
      }
    } catch (err: unknown) {
      const error = err as VeraError;
      if (error?.response?.status === 401) {
        throw new Error('Unauthorized: Invalid Vera API key');
      } else if (error?.response?.status === 429) {
        throw new Error('Rate limit exceeded: Please try again later');
      } else if (error?.code === 'ECONNABORTED') {
        throw new Error('Request timeout: Vera API is taking too long to respond');
      } else {
        throw new Error(`Vera API error: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Map FactCheckEntity to FactCheckResponseDto
   */
  private mapToResponseDto(entity: FactCheckEntity): FactCheckResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      query: entity.query,
      response: entity.response,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
