import { ApiProperty } from '@nestjs/swagger';
import { ContentPlatform } from '../entities/content.entity';

export class CreateContentDto {
  @ApiProperty({ description: 'Plateforme du contenu', enum: ContentPlatform })
  platform!: ContentPlatform;

  @ApiProperty({ description: 'URL du contenu', example: 'https://...' })
  url!: string;

  @ApiProperty({ description: 'Texte du contenu', required: false })
  text?: string;

  @ApiProperty({ description: 'Médias associés', required: false, type: Object })
  media?: Record<string, unknown>;

  @ApiProperty({ description: 'Métadonnées supplémentaires', required: false, type: Object })
  metadata?: Record<string, unknown>;
}
