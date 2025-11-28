import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FactCheckService } from './fact-check.service';
import { VerifyExternalFactDto } from './dto/verify-external-fact.dto';
import { JwtAuthGuard } from '@vera/api/features/auth';

@ApiTags('Fact Check')
@Controller('fact-check')
export class FactCheckController {
  constructor(private readonly factCheckService: FactCheckService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify a fact (Streaming response)' })
  @ApiResponse({ status: 201, description: 'Stream started' })
  async verify(@Body() dto: VerifyExternalFactDto, @Res() res: Response) {
    const stream = await this.factCheckService.verifyFactStream(
      dto.userId,
      dto.query
    );
    
    res.set({
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    });

    stream.pipe(res);
  }

  @Post('verify')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Verify fact with optional image analysis' })
  @ApiResponse({ status: 200, description: 'Verification completed' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async verifyWithImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { userId: string; query: string }
  ) {
    let factToCheck = body.query;

    // Si une image est fournie, l'analyser avec Gemini
    if (file) {
      const { description } = await this.factCheckService.uploadAndAnalyzeImage(file);
      
      if (body.query.trim()) {
        // Si on a du texte et une image, les combiner de manière fluide
        factToCheck = `SYSTEM: Tu es un vérificateur de faits direct et concis. RÉPONDS UNIQUEMENT avec les informations factuelles. NE COMMENCE JAMAIS par "Je vais vérifier", "Patientez", "Un instant", "Je suis en train de vérifier les faits". NE TERMINE JAMAIS par "Souhaitez-vous approfondir", "Si vous voulez explorer", "N'hésitez pas à me demander". Sois DIRECT et FACTUEL uniquement.

QUESTION À VÉRIFIER: ${description} ${body.query}`;
      } else {
        // Si seule l'image est présente, utiliser seulement l'analyse d'image
        factToCheck = `SYSTEM: Tu es un vérificateur de faits direct et concis. RÉPONDS UNIQUEMENT avec les informations factuelles. NE COMMENCE JAMAIS par "Je vais vérifier", "Patientez", "Un instant", "Je suis en train de vérifier les faits". NE TERMINE JAMAIS par "Souhaitez-vous approfondir", "Si vous voulez explorer", "N'hésitez pas à me demander". Sois DIRECT et FACTUEL uniquement.

QUESTION À VÉRIFIER: ${description}`;
      }
    } else {
      // Si pas d'image, vérifier s'il y a des URLs dans le texte
      const urls = this.extractUrlsFromText(body.query);
      
      if (urls.length > 0) {
        // Analyser la première URL trouvée avec Perplexity
        const urlAnalysis = await this.factCheckService.analyzeUrlWithPerplexity(urls[0]);
        
        factToCheck = `SYSTEM: Tu es un vérificateur de faits direct et concis. RÉPONDS UNIQUEMENT avec les informations factuelles. NE COMMENCE JAMAIS par "Je vais vérifier", "Patientez", "Un instant", "Je suis en train de vérifier les faits". NE TERMINE JAMAIS par "Souhaitez-vous approfondir", "Si vous voulez explorer", "N'hésitez pas à me demander". Sois DIRECT et FACTUEL uniquement.

URL ANALYSIS: ${urlAnalysis}

ORIGINAL QUERY: ${body.query}`;
      } else {
        // Si pas d'image et pas d'URL, ajouter quand même l'instruction pour le texte seul
        factToCheck = `SYSTEM: Tu es un vérificateur de faits direct et concis. RÉPONDS UNIQUEMENT avec les informations factuelles. NE COMMENCE JAMAIS par "Je vais vérifier", "Patientez", "Un instant", "Je suis en train de vérifier les faits". NE TERMINE JAMAIS par "Souhaitez-vous approfondir", "Si vous voulez explorer", "N'hésitez pas à me demander". Sois DIRECT et FACTUEL uniquement.

QUESTION À VÉRIFIER: ${body.query}`;
      }
    }

    // Vérifier le fait avec Vera
    return this.factCheckService.verifyFactExternal(body.userId, factToCheck);
  }

  private extractUrlsFromText(text: string): string[] {
    if (!text) return [];

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls: string[] = [];
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0].replace(/[.,;!?()]+$/, ''); // Supprimer la ponctuation à la fin
      if (!urls.includes(url)) {
        urls.push(url);
      }
    }

    return urls;
  }
}

