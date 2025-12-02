import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { FactCheckEntity, FactCheckStatus, ImageEntity } from '../entities/fact-check.entity';
import { firstValueFrom } from 'rxjs';
import { Readable, PassThrough } from 'stream';
import { SupabaseService } from '@vera/api/shared/data-access';

import { SearchService } from './search.service';
import { ClaimExtractorService } from './claim-extractor.service';
import { MediaAnalyzerService } from './media-analyzer.service';
import { FactCheckRepository } from '../repositories/fact-check.repository';

/**
 * Type propre pour les résultats de recherche (évite any[])
 */
type SearchHit = {
  score: number;
  source: string;
  title: string;
  url?: string;
  // propriétés additionnelles autorisées mais typées unknown
  [key: string]: unknown;
};

@Injectable()
export class FactCheckService {
  private readonly logger = new Logger(FactCheckService.name);
  private readonly veraApiUrl: string;
  private readonly veraApiKey: string;
  private readonly geminiApiKey: string;
  private readonly perplexityApiKey: string;

  constructor(
    @InjectRepository(FactCheckEntity)
    private readonly factCheckRepository: Repository<FactCheckEntity>,

    @InjectRepository(ImageEntity)
    private readonly image_repository: Repository<ImageEntity>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,

    private readonly searchService: SearchService,
    private readonly claimExtractor: ClaimExtractorService,
    private readonly mediaAnalyzer: MediaAnalyzerService,
    private readonly factCheckRepo: FactCheckRepository,
  ) {
    this.veraApiUrl = this.configService.get<string>('VERA_API_URL', '');
    this.veraApiKey = this.configService.get<string>('VERA_API_KEY', '');
    this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY', '');
    this.perplexityApiKey = this.configService.get<string>('PERPLEXITY_API_KEY', '');

    if (!this.veraApiKey) this.logger.warn('VERA_API_KEY is not set');
    if (!this.geminiApiKey) this.logger.warn('GEMINI_API_KEY is not set');
    if (!this.perplexityApiKey) this.logger.warn('PERPLEXITY_API_KEY is not set');
  }

  // -------------------------------------------------------------
  // Vérification vers l'API externe "Vera"
  // -------------------------------------------------------------
  async verifyFactExternal(userId: string, query: string): Promise<{ result: string }> {
    const factCheck = this.factCheckRepository.create({
      userId,
      query,
      status: FactCheckStatus.PENDING,
    });
    await this.factCheckRepository.save(factCheck);

    try {
      this.logger.log(`Verifying external fact: ${query}`);

      const response = await firstValueFrom(
        this.httpService.post(
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

      const result =
        typeof response.data === 'string'
          ? response.data
          : (response.data?.result as string) || 'No data received';

      factCheck.response = result;
      factCheck.status = FactCheckStatus.COMPLETED;
      await this.factCheckRepository.save(factCheck);

      return { result };
    } catch (error: unknown) {
      factCheck.status = FactCheckStatus.FAILED;
      await this.factCheckRepository.save(factCheck);

      this.logger.error(
        `Fact check ${factCheck.id} failed`,
        error instanceof Error ? error.message : String(error)
      );

      throw new Error(
        `Failed to verify fact: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // -------------------------------------------------------------
  // autoVerify : récupère le texte (ou prend l'id comme texte),
  // extrait les affirmations, recherche des sources et retourne un verdict simple
  // -------------------------------------------------------------
  async autoVerify(
  contentIdOrText: string,
  mediaFile?: Express.Multer.File
): Promise<{
  status: FactCheckStatus;
  message: string;
  report: Array<{
    claim: string;
    verdict: string;
    evidence: SearchHit[];
    mediaAnalysis?: { mediaType: string; description: string };
  }>;
}> {
  this.logger.log(`Auto-verifying content: ${contentIdOrText}`);

  const factCheck = this.factCheckRepository.create({
    userId: 'system',
    query: `auto_verify:${contentIdOrText}`,
    status: FactCheckStatus.PENDING,
  });
  await this.factCheckRepository.save(factCheck);

  // 1️⃣ Extraction des affirmations
  const claims = this.claimExtractor.extractClaimsFromText(contentIdOrText);

  // 2️⃣ Analyse du média si fourni
  let mediaAnalysis;
  if (mediaFile) {
    mediaAnalysis = await this.mediaAnalyzer.uploadAndAnalyzeMedia(mediaFile, this.geminiApiKey);
  }

  // 3️⃣ Préparation du rapport
  const report: Array<{
    claim: string;
    verdict: string;
    evidence: SearchHit[];
    mediaAnalysis?: { mediaType: string; description: string };
  }> = [];

  for (const c of claims) {
    // Recherche sur internet
    const hits = (await this.searchService.search(c.claim, 4)) as SearchHit[];

    // Calcul du verdict
    let verdict = 'insuffisant';
    const good = hits.filter(h => (typeof h.score === 'number' ? h.score : 0) >= 0.7);
    const medium = hits.filter(h => (typeof h.score === 'number' ? h.score : 0) >= 0.5);

    if (good.length) verdict = 'plutôt vrai';
    else if (medium.length) verdict = 'plutôt faux';

    report.push({ claim: c.claim, verdict, evidence: hits, mediaAnalysis });
  }

  // 4️⃣ Génération d’un résumé clair
  const summaryLines = report.map(r => {
    let line = `• "${r.claim}" → ${r.verdict}`;
    if (r.mediaAnalysis) {
      line += ` | Média: ${r.mediaAnalysis.mediaType}, Description: ${r.mediaAnalysis.description}`;
    }
    return line;
  });
  const summary = summaryLines.join('\n');

  factCheck.response = `Report:\n${summary}`;
  factCheck.status = FactCheckStatus.COMPLETED;
  await this.factCheckRepository.save(factCheck);

  return { status: factCheck.status, message: factCheck.response, report };
}


  // -------------------------------------------------------------
  // Streaming endpoint (proxy vers Vera streaming)
  // -------------------------------------------------------------
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

      stream.on('data', chunk => passThrough.write(chunk));
      stream.on('end', () => passThrough.end());
      stream.on('error', err => passThrough.emit('error', err));

      return passThrough;
    } catch (error: unknown) {
      this.logger.error('Error calling Vera API', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // -------------------------------------------------------------
  // Upload & analyse media (delegate to MediaAnalyzerService)
  // -------------------------------------------------------------
  async uploadAndAnalyzeMedia(
    file: Express.Multer.File
  ): Promise<{ mediaType: string; description: string }> {
    return this.mediaAnalyzer.uploadAndAnalyzeMedia(file, this.geminiApiKey);
  }

  // -------------------------------------------------------------
  // Analyse d'URL via Perplexity (ou fallback SearchService)
  // -------------------------------------------------------------
  async analyzeUrlWithPerplexity(url: string): Promise<string> {
    if (!this.perplexityApiKey) {
      const hits = await this.searchService.search(url, 3);
      return `Résumé (fallback) — ${hits.map(h => `${h.source}: ${h.title}`).join(' | ')}`;
    }

    const payload = {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant spécialisé en fact-checking. Résume le contenu factuel de l’URL et détecte les affirmations.',
        },
        {
          role: 'user',
          content: `Analyse cette URL : ${url}`,
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.perplexity.ai/chat/completions',
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return response.data?.choices?.[0]?.message?.content ?? 'Aucune analyse disponible';
    } catch (err: unknown) {
      this.logger.warn(
        `Perplexity analyze failed: ${err instanceof Error ? err.message : String(err)}`
      );
      // fallback to search summary
      const hits = await this.searchService.search(url, 3);
      return `Résumé (fallback) — ${hits.map(h => `${h.source}: ${h.title}`).join(' | ')}`;
    }
  }
}
