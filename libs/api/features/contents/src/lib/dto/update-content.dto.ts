import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ContentStatus } from '../entities/content.entity';

export class UpdateContentDto {
  @ApiPropertyOptional({ description: 'Statut', enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Résultat', example: 'Contenu vérifié comme vrai' })
  @IsOptional()
  @IsString()
  verification_result?: string | null;

  @ApiPropertyOptional({
    description: 'ID du fact-check',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  fact_check_id?: string | null;
}
