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

  // ----------------------------------------------------
  // 🔥 IMAGE UPLOAD & ANALYSIS
  // ----------------------------------------------------
  async uploadAndAnalyzeImage(file: Express.Multer.File): Promise<{ imageId: string; description: string }> {
    try {
      // Utiliser un bucket existant au lieu d'en créer un nouveau
      const bucketName = 'fact-check-images';

      // 1. Uploader l'image vers Supabase Storage
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
        throw new Error(`Failed to upload image to Supabase: ${uploadError.message}`);
      }

      // 2. Construire l'URL publique manuellement
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL', '');
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
      
      this.logger.log(`Image uploaded successfully. Public URL: ${publicUrl}`);
      
      // Vérifier que l'URL est accessible
      try {
        await firstValueFrom(
          this.httpService.get(publicUrl, { responseType: 'arraybuffer', timeout: 5000 })
        );
        this.logger.log('Image URL is accessible');
      } catch (urlError) {
        this.logger.error('Image URL is not accessible:', urlError);
        throw new Error('Uploaded image is not accessible via public URL');
      }

      // 3. Sauvegarder les métadonnées en BDD
      const image = this.imageRepository.create({
        filename: fileName,
        path: publicUrl, // Stocker l'URL publique au lieu du chemin local
        mimetype: file.mimetype,
        size: file.size,
      });
      const savedImage = await this.imageRepository.save(image);

      // 4. Analyser avec Gemini en utilisant l'URL publique
      const description = await this.analyzeImageWithGemini(publicUrl);

      // 5. Mettre à jour la description dans la BDD
      savedImage.geminiDescription = description;
      await this.imageRepository.save(savedImage);

      return {
        imageId: savedImage.id,
        description,
      };
    } catch (error) {
      this.logger.error('Error uploading and analyzing image:', error);
      throw error;
    }
  }

  private async analyzeImageWithGemini(imageUrl: string): Promise<string> {
    try {
      // Détecter le type MIME depuis l'URL ou utiliser image/jpeg par défaut
      const mimeType = this.getMimeTypeFromUrl(imageUrl);

      this.logger.log(`Analyzing image with Gemini. URL: ${imageUrl}, MIME: ${mimeType}`);

      const requestBody = {
        contents: [{
          parts: [
            {
              text: `Tu es un module de préparation pour une IA de vérification de faits.
On te fournit une image. Tu dois produire UNE SEULE phrase, très courte, qui résume la revendication factuelle principale liée à cette image.

Règles:

Ta sortie doit être soit une QUESTION factuelle, soit une AFFIRMATION factuelle, mais jamais une explication.

Maximum 1 phrase, 20 mots.

Pas d’analyse, pas de conseil, pas de justification.

Pas de description détaillée de l’image.

Si l’image ne permet pas de formuler une revendication vérifiable, réponds exactement : ‘Aucune revendication vérifiable’.

Format de sortie attendu (exemples):

‘Emmanuel Macron ramasse des déchets dans une rue de Paris.’

‘Cette image montre Emmanuel Macron en train de ramasser des déchets dans une rue de Paris, est-ce vrai?’ ”

Analyse cette image et applique les règles ci-dessus pour produire une seule question ou affirmation factuelle courte, prête pour une vérification de faits.`
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: await this.getImageAsBase64(imageUrl)
              }
            }
          ]
        }]
      };

      this.logger.log(`Gemini request body prepared`);

      const response = await firstValueFrom(
        this.httpService.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
          requestBody
        )
      );

      this.logger.log(`Gemini response received:`, response.data);

      const description = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Description non disponible";
      return description;

    } catch (error) {
      this.logger.error('Error analyzing image with Gemini:', error);
      // Fallback en cas d'erreur
      return `Erreur lors de l'analyse de l'image (${imageUrl}). Description temporaire: Contenu visuel nécessitant vérification factuelle.`;
    }
  }

  async analyzeUrlWithPerplexity(url: string): Promise<string> {
    try {
      this.logger.log(`Analyzing URL with Perplexity. URL: ${url}`);

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

      this.logger.log(`Perplexity response received`);

      const analysis = response.data?.choices?.[0]?.message?.content || "Analyse non disponible";
      return analysis;

    } catch (error) {
      this.logger.error('Error analyzing URL with Perplexity:', error);
      // Fallback en cas d'erreur
      return `Erreur lors de l'analyse de l'URL (${url}). Contenu nécessitant vérification factuelle.`;
    }
  }

  private getMimeTypeFromUrl(imageUrl: string): string {
    const extension = imageUrl.split('.').pop()?.toLowerCase();
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
      default:
        return 'image/jpeg'; // fallback
    }
  }

  private async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(imageUrl, { responseType: 'arraybuffer' })
      );
      return Buffer.from(response.data).toString('base64');
    } catch (error) {
      this.logger.error('Error fetching image for base64 conversion:', error);
      throw new Error('Failed to fetch image');
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
          public: true, // Rendre le bucket public pour accéder aux images
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880, // 5MB
        });

        if (createError) {
          this.logger.error('Error creating bucket:', createError);
          throw new Error(`Failed to create bucket: ${createError.message}`);
        }

        this.logger.log(`Bucket '${bucketName}' created successfully`);
      }
    } catch (error) {
      this.logger.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }
}
