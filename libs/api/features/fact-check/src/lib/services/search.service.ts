import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

type SourceDef = { name: string; rss?: string };

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  // Liste de sources fiables
  private readonly sources: SourceDef[] = [
    {
      name: 'Reuters',
      rss: 'https://www.reutersagency.com/feed/?taxonomy=best-regions&post_type=best',
    },
    {
      name: 'Le Monde - Les Décodeurs',
      rss: 'https://www.lemonde.fr/les-decodeurs/rss_full.xml',
    },
    { name: 'AFP', rss: '' }, // AFP ne donne pas de RSS public
    {
      name: 'Snopes',
      rss: 'https://www.snopes.com/feed/',
    },
  ];

  constructor(private readonly http: HttpService) {}

  async search(
    query: string,
    limit = 5,
  ): Promise<
    Array<{
      source: string;
      title: string;
      url: string;
      snippet: string;
      score: number;
    }>
  > {
    const results: Array<{
      source: string;
      title: string;
      url: string;
      snippet: string;
      score: number;
    }> = [];

    /**
     * 1) TENTATIVE VIA RSS
     */
    for (const s of this.sources) {
      if (!s.rss) continue;

      try {
        const res = await firstValueFrom(
          this.http.get(s.rss, { responseType: 'text' }),
        );
        const xml = res.data;

        const $ = cheerio.load(xml, { xmlMode: true });

        $('item').each((i, el) => {
          if (results.length >= limit) return;

          const title = $(el).find('title').first().text().trim();
          const link = $(el).find('link').first().text().trim();
          const desc = $(el).find('description').first().text().trim();

          const fullText = `${title} ${desc}`.toLowerCase();

          if (fullText.includes(query.toLowerCase())) {
            results.push({
              source: s.name,
              title,
              url: link,
              snippet: desc.slice(0, 300),
              score: 0.9,
            });
          }
        });
      } catch (err: unknown) {
        // safe logging: optional chaining + normalized err
        this.logger.debug(
          `RSS fetch failed for ${s?.name ?? 'unknown'}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }

    /**
     * 2) SI PAS ASSEZ DE RÉSULTATS → SCRAPING SIMPLE
     */
    if (results.length < limit) {
      const sites = [
        {
          name: 'Le Monde',
          url: `https://www.lemonde.fr/recherche/?search_keywords=${encodeURIComponent(
            query,
          )}`,
        },
        {
          name: 'Reuters',
          url: `https://www.reuters.com/site-search/?query=${encodeURIComponent(
            query,
          )}`,
        },
      ];

      for (const site of sites) {
        if (results.length >= limit) break;

        try {
          const r = await firstValueFrom(
            this.http.get(site.url, { responseType: 'text' }),
          );
          const $ = cheerio.load(r.data);

          $('a').each((i, el) => {
            if (results.length >= limit) return;

            const title = $(el).text().trim();
            let href = $(el).attr('href') || '';

            if (!title) return;

            if (!href.startsWith('http')) {
              try {
                href = new URL(href, site.url).toString();
              } catch {
                return;
              }
            }

            const snippet = title.slice(0, 200);

            if (
              title.toLowerCase().includes(query.toLowerCase()) ||
              snippet.toLowerCase().includes(query.toLowerCase())
            ) {
              results.push({
                source: site.name,
                title,
                url: href,
                snippet,
                score: 0.6,
              });
            }
          });
        } catch (err: unknown) {
          this.logger.debug(
            `Site search failed for ${site?.name ?? 'unknown'}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }
    }

    return results.slice(0, limit);
  }
}
