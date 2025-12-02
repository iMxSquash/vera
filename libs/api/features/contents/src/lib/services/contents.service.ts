import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateContentDto } from '../dto/create-content.dto';
import { Content, ContentStatus } from '../entities/content.entity';

@Injectable()
export class ContentsService {
  private contents: Content[] = []; // temporaire en mémoire, remplacer par DB plus tard

  async searchContents(query: string) {
    return [
      {
        score: 0.98,
        source: 'internal',
        title: `Résultat trouvé pour "${query}"`,
        url: 'https://exemple.com/article',
      },
    ];
  }

  async getSummary(content: string): Promise<string> {
    return `Résumé automatique : ${content.slice(0, 120)}...`;
  }

  // Méthode create pour Telegram ou autres
  async create(dto: CreateContentDto): Promise<Content> {
    const newContent = new Content();  // ✅ on crée une instance de classe
    newContent.id = uuidv4();
    newContent.platform = dto.platform;
    newContent.url = dto.url;
    newContent.text = dto.text ?? null;
    newContent.media = dto.media ?? {};
    newContent.metadata = dto.metadata ?? {};
    newContent.status = ContentStatus.PENDING;
    newContent.verification_result = null;
    newContent.fact_check_id = null;
    newContent.createdAt = new Date();
    newContent.updatedAt = new Date();

    this.contents.push(newContent); // en mémoire
    return newContent;
  }
}
