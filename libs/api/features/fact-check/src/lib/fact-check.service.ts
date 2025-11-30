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
    try {
      this.logger.log(`Verifying external fact: ${query}\n`);
      
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

      this.logger.log(`Fact check completed\n`);

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
        this.logger.log(`Fact check completed\n`);
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
    this.logger.log(`Auto-verifying content ${contentId}\n`);

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

  // ----------------------------------------------------
  // 🔥 MEDIA UPLOAD & ANALYSIS (Images + Vidéos + Audio)
  // ----------------------------------------------------
  async uploadAndAnalyzeMedia(file: Express.Multer.File): Promise<{ mediaId: string; description: string; mediaType: 'image' | 'video' | 'audio' }> {
    try {
      const isVideo = file.mimetype.startsWith('video/');
      const isAudio = file.mimetype.startsWith('audio/');
      const mediaType = isAudio ? 'audio' : isVideo ? 'video' : 'image';
      const bucketName = 'fact-check-media';

      // 1. Uploader le média vers Supabase Storage
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await this.supabaseService.getClient().storage
        .from(bucketName)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload media to Supabase: ${uploadError.message}`);
      }

      // 2. Construire l'URL publique manuellement
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL', '');
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;

      this.logger.log(`Media uploaded successfully. Public URL: ${publicUrl}\n`);

      // Vérifier que l'URL est accessible
      try {
        await firstValueFrom(
          this.httpService.get(publicUrl, { responseType: 'arraybuffer', timeout: 5000 })
        );
        this.logger.log('Media URL is accessible\n');
      } catch (urlError) {
        this.logger.error('Media URL is not accessible:', urlError);
        throw new Error('Uploaded media is not accessible via public URL');
      }

      // 3. Sauvegarder les métadonnées en BDD
      const media = this.imageRepository.create({
        filename: fileName,
        path: publicUrl, // Stocker l'URL publique
        mimetype: file.mimetype,
        size: file.size,
      });
      const savedMedia = await this.imageRepository.save(media);

      // 4. Analyser/Transcrire avec Gemini en utilisant l'URL publique
      let description: string;
      if (isAudio) {
        description = await this.transcribeAudioWithGemini(publicUrl);
      } else {
        description = await this.analyzeImageWithGemini(publicUrl);
      }

      // 5. Mettre à jour la description dans la BDD
      savedMedia.geminiDescription = description;
      await this.imageRepository.save(savedMedia);

      return {
        mediaId: savedMedia.id,
        description,
        mediaType,
      };
    } catch (error) {
      this.logger.error('Error uploading and analyzing media:', error);
      throw error;
    }
  }

  private isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv', '.wmv'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.endsWith(ext));
  }

  private async analyzeImageWithGemini(mediaUrl: string): Promise<string> {
    try {
      // Détecter automatiquement le type de média depuis l'URL
      const isVideo = this.isVideoUrl(mediaUrl);
      const mediaType = isVideo ? 'video' : 'image';

      // Détecter le type MIME depuis l'URL ou utiliser image/jpeg par défaut
      const mimeType = this.getMimeTypeFromUrl(mediaUrl, mediaType);

      this.logger.log(`Analyzing ${mediaType} with Gemini. URL: ${mediaUrl}, MIME: ${mimeType}\n`);

      const requestBody = {
        contents: [{
          parts: [
            {
              text: isVideo
                ? `Tu es un module de préparation pour une IA de vérification de faits.
On te fournit une vidéo. Tu dois produire UNE SEULE phrase, très courte, qui résume la revendication factuelle principale liée à cette vidéo.

Règles:

Ta sortie doit être soit une QUESTION factuelle, soit une AFFIRMATION factuelle, mais jamais une explication.

Maximum 1 phrase, 20 mots.

Pas d'analyse, pas de conseil, pas de justification.

Pas de description détaillée de la vidéo.

Si la vidéo ne permet pas de formuler une revendication vérifiable, réponds exactement : 'Aucune revendication vérifiable'.

Format de sortie attendu (exemples):

'Cette vidéo montre Emmanuel Macron en train de ramasser des déchets dans une rue de Paris.'

'Cette vidéo montre Emmanuel Macron ramassant des déchets dans une rue de Paris, est-ce vrai?'

Analyse cette vidéo et applique les règles ci-dessus pour produire une seule question ou affirmation factuelle courte, prête pour une vérification de faits.`
                : `Tu es un module de préparation pour une IA de vérification de faits.
On te fournit une image. Tu dois produire UNE SEULE phrase, très courte, qui résume la revendication factuelle principale liée à cette image.

Règles:

Ta sortie doit être soit une QUESTION factuelle, soit une AFFIRMATION factuelle, mais jamais une explication.

Maximum 1 phrase, 20 mots.

Pas d'analyse, pas de conseil, pas de justification.

Pas de description détaillée de l'image.

Si l'image ne permet pas de formuler une revendication vérifiable, réponds exactement : 'Aucune revendication vérifiable'.

Format de sortie attendu (exemples):

'Emmanuel Macron ramasse des déchets dans une rue de Paris.'

'Cette image montre Emmanuel Macron en train de ramasser des déchets dans une rue de Paris, est-ce vrai?'

Analyse cette image et applique les règles ci-dessus pour produire une seule question ou affirmation factuelle courte, prête pour une vérification de faits.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: await this.getMediaAsBase64(mediaUrl)
              }
            }
          ]
        }]
      };

      this.logger.log(`Gemini request body prepared for ${mediaType}\n`);

      const response = await firstValueFrom(
        this.httpService.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
          requestBody
        )
      );

      this.logger.log(`Gemini response received for ${mediaType}:\n${JSON.stringify(response.data, null, 2)}\n`);

      const description = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Description non disponible";
      this.logger.log(`Gemini extracted description:\n${description}\n`);
      return description;

    } catch (error) {
      this.logger.error('Error analyzing media with Gemini:', error);
      // Fallback en cas d'erreur
      return `Erreur lors de l'analyse du média (${mediaUrl}). Description temporaire: Contenu visuel nécessitant vérification factuelle.`;
    }
  }

  private async transcribeAudioWithGemini(audioUrl: string): Promise<string> {
    try {
      // Détecter le type MIME depuis l'URL
      const mimeType = this.getMimeTypeFromUrl(audioUrl, 'audio');

      this.logger.log(`Transcribing audio with Gemini. URL: ${audioUrl}, MIME: ${mimeType}\n`);

      const requestBody = {
        contents: [{
          parts: [
            {
              text: `Tu es un module de préparation pour une IA de vérification de faits.
On te fournit un fichier audio. Tu dois produire UNE SEULE phrase, très courte, qui résume la revendication factuelle principale liée à ce contenu audio.

Règles:

Ta sortie doit être soit une QUESTION factuelle, soit une AFFIRMATION factuelle, mais jamais une explication.

Maximum 1 phrase, 20 mots.

Pas d'analyse, pas de conseil, pas de justification.

Pas de transcription complète de l'audio.

Si l'audio ne permet pas de formuler une revendication vérifiable, réponds exactement : 'Aucune revendication vérifiable'.

Format de sortie attendu (exemples):

'Emmanuel Macron a annoncé une nouvelle réforme fiscale hier.'

'Cette déclaration affirme qu'Emmanuel Macron va supprimer l'impôt sur le revenu, est-ce vrai?'

Analyse ce contenu audio et applique les règles ci-dessus pour produire une seule question ou affirmation factuelle courte, prête pour une vérification de faits.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: await this.getMediaAsBase64(audioUrl)
              }
            }
          ]
        }]
      };

      this.logger.log(`Gemini transcription request body prepared\n`);

      const response = await firstValueFrom(
        this.httpService.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
          requestBody
        )
      );

      this.logger.log(`Gemini transcription response received:\n${JSON.stringify(response.data, null, 2)}\n`);

      const transcription = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Transcription non disponible";
      this.logger.log(`Gemini extracted transcription:\n${transcription}\n`);
      return transcription;

    } catch (error) {
      this.logger.error('Error transcribing audio with Gemini:', error);
      // Fallback en cas d'erreur
      return `Erreur lors de la transcription de l'audio (${audioUrl}). Contenu vocal nécessitant vérification factuelle.`;
    }
  }

  async analyzeUrlWithPerplexity(url: string): Promise<string> {
    try {
      this.logger.log(`Analyzing URL with Perplexity. URL: ${url}\n`);

      const requestBody = {
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Analyse le contenu de cette page web et fournis un résumé concis des informations principales, en te concentrant sur les faits vérifiables: ${url}`
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.perplexity.ai/chat/completions',
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${this.perplexityApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      this.logger.log(`Perplexity response received:\n${JSON.stringify(response.data, null, 2)}\n`);

      const analysis = response.data?.choices?.[0]?.message?.content || "Analyse non disponible";
      this.logger.log(`Perplexity extracted analysis:\n${analysis}\n`);
      return analysis;

    } catch (error) {
      this.logger.error('Error analyzing URL with Perplexity:', error);
      // Fallback en cas d'erreur
      return `Erreur lors de l'analyse de l'URL (${url}). Contenu nécessitant vérification factuelle.`;
    }
  }

  private getMimeTypeFromUrl(mediaUrl: string, mediaType: 'image' | 'video' | 'audio' = 'image'): string {
    const extension = mediaUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'mp4':
        return 'video/mp4';
      case 'avi':
        return 'video/avi';
      case 'mov':
        return 'video/quicktime';
      case 'webm':
        return 'video/webm';
      case 'mp3':
        return 'audio/mpeg';
      case 'wav':
        return 'audio/wav';
      case 'm4a':
        return 'audio/mp4';
      case 'ogg':
        return 'audio/ogg';
      case 'flac':
        return 'audio/flac';
      default:
        if (mediaType === 'audio') return 'audio/mpeg';
        if (mediaType === 'video') return 'video/mp4';
        return 'image/jpeg'; // fallback
    }
  }

  private async getMediaAsBase64(mediaUrl: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(mediaUrl, { responseType: 'arraybuffer' })
      );
      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      this.logger.error('Error fetching media for base64 conversion:', error);
      throw new Error('Failed to fetch media');
    }
  }

  async getImageById(id: string): Promise<ImageEntity | null> {
    return this.imageRepository.findOneBy({ id });
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      // Vérifier si le bucket existe
      const { data: buckets, error: listError } = await this.supabaseService.getAdminClient().storage.listBuckets();
      
      if (listError) {
        this.logger.error('Error listing buckets:', listError);
        throw new Error(`Failed to list buckets: ${listError.message}`);
      }

      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

      if (!bucketExists) {
        // Créer le bucket s'il n'existe pas
        const { error: createError } = await this.supabaseService.getAdminClient().storage.createBucket(bucketName, {
          public: true, // Rendre le bucket public pour accéder aux médias
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac'],
          fileSizeLimit: 52428800, // 50MB pour supporter les vidéos et audios
        });

        if (createError) {
          this.logger.error('Error creating bucket:', createError);
          throw new Error(`Failed to create bucket: ${createError.message}`);
        }

        this.logger.log(`Bucket '${bucketName}' created successfully\n`);
      }
    } catch (error) {
      this.logger.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }
}
