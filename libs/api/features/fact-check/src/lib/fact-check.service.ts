import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FactCheckStatus } from './entities/fact-check.entity';
import { ImageEntity } from './entities/fact-check.entity';
import { firstValueFrom } from 'rxjs';
import { Readable, PassThrough } from 'stream';
import { SupabaseService } from '@vera/api/shared/data-access';

@Injectable()
export class FactCheckService {
  private readonly logger = new Logger(FactCheckService.name);
  private readonly veraApiUrl: string;
  private readonly veraApiKey: string;
  private readonly geminiApiKey: string;
  private readonly perplexityApiKey: string;

  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService
  ) {
    this.veraApiUrl = this.configService.get<string>('VERA_API_URL', 'https://api.vera.example/api/v1/chat');
    this.veraApiKey = this.configService.get<string>('VERA_API_KEY', '');
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.perplexityApiKey = this.configService.get<string>('PERPLEXITY_API_KEY', '');
    
    if (!this.veraApiKey) {
      this.logger.warn('VERA_API_KEY is not set');
    }
    if (!this.geminiApiKey) {
      this.logger.warn('GEMINI_API_KEY is not set');
    }
    if (!this.perplexityApiKey) {
      this.logger.warn('PERPLEXITY_API_KEY is not set');
    }
  }

  async verifyFactExternal(userId: string, query: string): Promise<{ result: string }> {
    const factCheck = this.factCheckRepository.create({
      userId,
      query,
      status: FactCheckStatus.PENDING,
    });
    await this.factCheckRepository.save(factCheck);

    try {
      this.logger.log(`Verifying externala fact: ${query}`);
      
      const response = await firstValueFrom(
        this.httpService.post<{ result: string }>(
          this.veraApiUrl,
          { userId, query },
          {
            headers: {
              'X-API-Key': this.veraApiKey,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      let result: string;
      if (typeof response.data === 'string') {
        result = response.data;
      } else {
        result = response.data?.result || 'No data received';
      }

      factCheck.response = result;
      factCheck.status = FactCheckStatus.COMPLETED;
      await this.factCheckRepository.save(factCheck);
      this.logger.log(`Fact check ${factCheck.id} completed`);

      return { result };

    } catch (error) {
      factCheck.status = FactCheckStatus.FAILED;
      await this.factCheckRepository.save(factCheck);
      this.logger.error(`Fact check ${factCheck.id} failed`, error);
      throw new Error(`Failed to verify fact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async autoVerify(contentId: string): Promise<{
    status: FactCheckStatus;
    message: string;
  }> {
    this.logger.log(`Auto-verifying content ${contentId}`);

    const factCheck = await this.factCheckRepository.findOne({
      where: { id: contentId },
    });

    if (!factCheck) {
      return {
        status: FactCheckStatus.FAILED,
        message: "Fact check not found",
      };
    }

    const fakeResult = "Exemple de résultat automatique";

    factCheck.status = FactCheckStatus.COMPLETED;
    factCheck.response = fakeResult;

    await this.factCheckRepository.save(factCheck);

    return {
      status: factCheck.status,
      message: factCheck.response,
    };
  }

  async findAll(): Promise<FactCheckEntity[]> {
    return this.factCheckRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FactCheckEntity | null> {
    return this.factCheckRepository.findOneBy({ id });
  }

  async verifyFactStream(userId: string, query: string): Promise<Readable> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Readable>(
          this.veraApiUrl,
          { userId, query },
          {
            headers: {
              'X-API-Key': this.veraApiKey,
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
          }
        )
      );

      const stream: Readable = response.data;
      const passThrough = new PassThrough();

      stream.on('data', (chunk) => {
        passThrough.write(chunk);
      });

      stream.on('end', async () => {
        passThrough.end();
        this.logger.log(`Fact check completed`);
      });

      stream.on('error', async (err) => {
        passThrough.emit('error', err);
        this.logger.error(`Fact check failed`, err);
      });

      return passThrough;

    } catch (error) {
      this.logger.error('Error calling Vera API', error);
      throw error;
    }
  }
}
