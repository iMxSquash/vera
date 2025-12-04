import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MediaAnalyzerService {
  private readonly logger = new Logger(MediaAnalyzerService.name);

  constructor(private readonly http: HttpService) {}

  // Upload + analyze with Gemini (as provided)
  async uploadAndAnalyzeMedia(file: Express.Multer.File, geminiApiKey?: string): Promise<{ mediaType: string; description: string }> {
    if (!file) throw new Error('No media file provided');
    const base64 = file.buffer.toString('base64');
    const mime = file.mimetype;

    if (!geminiApiKey) {
      // fallback: return simple metadata
      return { mediaType: mime.split('/')[0], description: `Fichier ${mime}, taille ${file.size} octets — pas de clé Gemini configurée.` };
    }

    const payload = {
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mime,
                data: base64,
              },
            },
            {
              text: "Décris exactement ce que montre ce média. Pas d'avis, pas d'interprétation, uniquement factuel."
            }
          ],
        },
      ],
    };

    try {
      const res = await firstValueFrom(
        this.http.post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
          payload,
          { params: { key: geminiApiKey } }
        )
      );
      const description = res.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Aucune description disponible";
      return { mediaType: mime.split('/')[0], description };
    } catch (err) {
      this.logger.warn(
  'Gemini analyze failed, fallback',
  err instanceof Error ? err.message : String(err)
);

      return { mediaType: mime.split('/')[0], description: 'Analyse Gemini échouée, description non disponible' };
    }
  }

  // Deepfake detection placeholder (open-source heavy => here heuristics)
  // returns a score 0..1 (1 = très probable deepfake)
  async detectDeepfakePlaceholder(file: Express.Multer.File): Promise<{ aiProbability: number; reasons: string[] }> {
    // Simple heuristic: if file size tiny for video => suspicious
    const reasons: string[] = [];
    let score = 0.05;

    if (file.mimetype.startsWith('image/')) {
      if (file.size < 10_000) { score += 0.15; reasons.push('Image très petite'); }
    } else if (file.mimetype.startsWith('video/')) {
      if (file.size < 50_000) { score += 0.2; reasons.push('Vidéo très petite'); }
    }

    // Add placeholder note
    reasons.push('Vérification automatique limitée — pour meilleure détection, intégrer FaceForensics/Deepware ou un service payant.');

    return { aiProbability: Math.min(1, score), reasons };
  }
}
