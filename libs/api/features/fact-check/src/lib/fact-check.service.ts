import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FactCheckEntity, FactCheckStatus } from './entities/fact-check.entity';
import { firstValueFrom } from 'rxjs';
import { Readable, PassThrough } from 'stream';

@Injectable()
export class FactCheckService {
  private readonly logger = new Logger(FactCheckService.name);
  private readonly veraApiUrl: string;
  private readonly veraApiKey: string;

  constructor(
    @InjectRepository(FactCheckEntity)
    private readonly factCheckRepository: Repository<FactCheckEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.veraApiUrl = this.configService.get<string>('VERA_API_URL', 'https://api.vera.example/api/v1/chat');
    this.veraApiKey = this.configService.get<string>('VERA_API_KEY', '');
    
    if (!this.veraApiKey) {
      this.logger.warn('VERA_API_KEY is not set');
    }
  }

  async verifyFactStream(userId: string, query: string): Promise<Readable> {
    // 1. Create pending record
    const factCheck = this.factCheckRepository.create({
      userId,
      query,
      status: FactCheckStatus.PENDING,
    });
    await this.factCheckRepository.save(factCheck);

    try {
      // 2. Call Vera API
      const response = await firstValueFrom(
        this.httpService.post(
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
      let fullResponse = '';

      // 3. Intercept stream to save to DB
      stream.on('data', (chunk) => {
        fullResponse += chunk.toString();
        passThrough.write(chunk);
      });

      stream.on('end', async () => {
        passThrough.end();
        // 4. Update record on completion
        factCheck.response = fullResponse;
        factCheck.status = FactCheckStatus.COMPLETED;
        await this.factCheckRepository.save(factCheck);
        this.logger.log(`Fact check ${factCheck.id} completed`);
      });

      stream.on('error', async (err) => {
        passThrough.emit('error', err);
        factCheck.status = FactCheckStatus.FAILED;
        await this.factCheckRepository.save(factCheck);
        this.logger.error(`Fact check ${factCheck.id} failed`, err);
      });

      return passThrough;

    } catch (error) {
      factCheck.status = FactCheckStatus.FAILED;
      await this.factCheckRepository.save(factCheck);
      this.logger.error('Error calling Vera API', error);
      throw error;
    }
  }

  async autoVerify(contentId: string): Promise<void> {
    this.logger.log(`Auto-verifying content ${contentId}`);
    // TODO: Fetch content from ContentsService and call verifyFactStream
    // This will be implemented when ContentsService is ready (Step 2.3)
  }

  async findAll(): Promise<FactCheckEntity[]> {
    return this.factCheckRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FactCheckEntity | null> {
    return this.factCheckRepository.findOneBy({ id });
  }
}
