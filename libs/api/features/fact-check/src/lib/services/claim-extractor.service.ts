import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClaimExtractorService {
  private readonly logger = new Logger(ClaimExtractorService.name);

  constructor(private readonly http: HttpService) {}

  /**
   * Extraction simple d'affirmations : on split en phrases,
   * on garde celles qui ressemblent à des affirmations factuelles (heuristique).
   * Si tu as une clé LLM (OPENAI/VERA), tu peux remplacer par un appel LLM.
   */
  extractClaimsFromText(text: string): Array<{ claim: string }> {
    if (!text) return [];

    // split naive by punctuation
    const sentences = text
      .replace(/\n/g, ' ')
      .split(/(?<=[.!?;])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    const keywords = ['dit', 'déclare', 'a annoncé', 'a dit', 'sera', 'sera interdit', 'est', 'sont', 'aurait', 'affirme', 'prétend', 'annoncé'];

    const claims = sentences
      .filter(s => {
        const sl = s.toLowerCase();
        // heuristique: présence de mots clés et longueur raisonnable
        return sl.length > 10 && keywords.some(k => sl.includes(k));
      })
      .map(c => ({ claim: c }));

    // if none found, return first 1-2 sentences as fallback
    if (claims.length === 0 && sentences.length > 0) {
      return sentences.slice(0, 2).map(c => ({ claim: c }));
    }

    return claims;
  }

  // Optional: wrapper for LLM-based extraction if you add a key.
  async extractWithLLM(text: string, llmUrl?: string, apiKey?: string): Promise<Array<{ claim: string }>> {
    if (!llmUrl || !apiKey) return this.extractClaimsFromText(text);

    try {
      const payload = {
        model: 'gpt-like',
        prompt: `Extract the factual claims (short) from the following text. Return JSON array of strings.\n\n${text}`,
      };
      const res = await firstValueFrom(this.http.post(llmUrl, payload, { headers: { Authorization: `Bearer ${apiKey}` } }));
      const content = res.data?.choices?.[0]?.text ?? res.data?.result;
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed.map((c: string) => ({ claim: c })) : this.extractClaimsFromText(text);
    } catch (err: unknown) {
  this.logger.warn(
    `LLM extraction failed: ${err instanceof Error ? err.message : String(err)}`
  );
  return this.extractClaimsFromText(text);
}

  }
}
