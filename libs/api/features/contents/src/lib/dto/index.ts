import { ApiProperty } from '@nestjs/swagger';
import { ContentPlatform, ContentStatus } from '../entities/content.entity';

export class CreateContentDto {
  @ApiProperty({
    description: 'Plateforme du contenu',
    enum: ContentPlatform,
    example: ContentPlatform.TIKTOK,
  })
  platform!: ContentPlatform;

  @ApiProperty({
    description: 'URL du contenu',
    example: 'https://www.tiktok.com/@user/video/123456789',
  })
  url!: string;

  @ApiProperty({
    description: 'Texte du contenu',
    required: false,
    example: 'Ceci est un exemple de contenu TikTok',
  })
  text?: string;

  @ApiProperty({
    description: 'Médias associés (images, vidéos)',
    required: false,
    type: Object,
  })
  media?: Record<string, unknown>;

  @ApiProperty({
    description: 'Métadonnées supplémentaires',
    required: false,
    type: Object,
  })
  metadata?: Record<string, unknown>;
}

export class UpdateContentDto {
  @ApiProperty({
    description: 'Statut du contenu',
    enum: ContentStatus,
    required: false,
  })
  status?: ContentStatus;

  @ApiProperty({
    description: 'Résultat de la vérification',
    required: false,
    example: 'Contenu vérifié comme vrai',
  })
  verification_result?: string;

  @ApiProperty({
    description: 'ID du fact-check associé',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  fact_check_id?: string;
}

export class ContentResponseDto {
  @ApiProperty({
    description: 'ID du contenu',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Plateforme du contenu',
    enum: ContentPlatform,
  })
  platform!: ContentPlatform;

  @ApiProperty({
    description: 'URL du contenu',
  })
  url!: string;

  @ApiProperty({
    description: 'Texte du contenu',
  })
  text!: string;

  @ApiProperty({
    description: 'Médias associés',
  })
  media!: Record<string, unknown>;

  @ApiProperty({
    description: 'Métadonnées supplémentaires',
  })
  metadata!: Record<string, unknown>;

  @ApiProperty({
    description: 'Statut du contenu',
    enum: ContentStatus,
  })
  status!: ContentStatus;

  @ApiProperty({
    description: 'Résultat de la vérification',
  })
  verification_result!: string;

  @ApiProperty({
    description: 'ID du fact-check associé',
  })
  fact_check_id!: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2025-11-24T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date de mise à jour',
    example: '2025-11-24T10:00:00.000Z',
  })
  updatedAt!: Date;
}