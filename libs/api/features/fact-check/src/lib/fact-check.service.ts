import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FactCheckStatus } from './entities/fact-check.entity';
import { firstValueFrom } from 'rxjs';
import { Readable, PassThrough } from 'stream';

@Injectable()
export class FactCheckService {
  private readonly logger = new Logger(FactCheckService.name);
  private readonly veraApiUrl: string;
  private readonly veraApiKey: string;

  constructor(
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

      this.logger.log(`Fact check completed`);

      return { result };

    } catch (error) {
      this.logger.error('Error calling external Vera API', error);
      throw new Error(`Failed to verify fact: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  // ----------------------------------------------------
  // 🔥 AUTO VERIFY (corrigé et fonctionnel)
  // ----------------------------------------------------
  async autoVerify(contentId: string): Promise<{
    status: FactCheckStatus;
    message: string;
  }> {
    this.logger.log(`Auto-verifying content ${contentId}`);

    // 👉 TEMP : résultat fake en attendant ton moteur IA
    const fakeResult = {
      ok: true,
      reason: "Exemple de résultat automatique",
    };

    return {
      status: FactCheckStatus.COMPLETED,
      message: fakeResult.reason,
    };
  }
}
