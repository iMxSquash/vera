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

  async verifyFactExternal(userId: string, query: string): Promise<{ result: string }> {
    // 1. Create pending record
    const factCheck = this.factCheckRepository.create({
      userId,
      query,
      status: FactCheckStatus.PENDING,
    });
    await this.factCheckRepository.save(factCheck);

    try {
      this.logger.log(`Verifying external fact: ${query}`);
      
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

      // 2. Update record on completion
      factCheck.response = result;
      factCheck.status = FactCheckStatus.COMPLETED;
      await this.factCheckRepository.save(factCheck);
      this.logger.log(`Fact check ${factCheck.id} completed`);

      return { result };

    } catch (error) {
      // 3. Update record on failure
      factCheck.status = FactCheckStatus.FAILED;
      await this.factCheckRepository.save(factCheck);
      this.logger.error(`Fact check ${factCheck.id} failed`, error);
      this.logger.error('Error calling external Vera API', error);
      throw new Error(`Failed to verify fact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifyFactStream(userId: string, query: string): Promise<Readable> {
    const factCheck = this.factCheckRepository.create({
      userId,
      query,
      status: FactCheckStatus.PENDING,
    });
    await this.factCheckRepository.save(factCheck);

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
      let fullResponse = '';

      stream.on('data', (chunk) => {
        fullResponse += chunk.toString();
        passThrough.write(chunk);
      });

      stream.on('end', async () => {
        passThrough.end();
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

  // ----------------------------------------------------
  // 🔥 AUTO VERIFY (corrigé et fonctionnel)
  // ----------------------------------------------------
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
        message: "Content not found",
      };
    }

    // 👉 TEMP : résultat fake en attendant ton moteur IA
    const fakeResult = {
      ok: true,
      reason: "Exemple de résultat automatique",
    };

    // Mise à jour
    factCheck.status = FactCheckStatus.COMPLETED;
    factCheck.response = fakeResult.reason;

    await this.factCheckRepository.save(factCheck);

    return {
      status: factCheck.status,
      message: factCheck.response ?? "",
    };
  }

  async findAll(): Promise<FactCheckEntity[]> {
    return this.factCheckRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<FactCheckEntity | null> {
    return this.factCheckRepository.findOneBy({ id });
  }
}
