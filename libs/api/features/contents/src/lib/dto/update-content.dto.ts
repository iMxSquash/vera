import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '../entities/content.entity';
// Importation nécessaire pour la validation des classes (si vous l'utilisez)
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator'; 

export class UpdateContentDto {
  @ApiPropertyOptional({ // Changé pour Optional
    description: 'Statut du contenu',
    enum: ContentStatus,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ // Changé pour Optional
    description: 'Résultat de la vérification',
    example: 'Contenu vérifié comme vrai',
  })
  @IsOptional()
  @IsString()
  verification_result?: string | null;

  @ApiPropertyOptional({ // Changé pour Optional
    description: 'ID du fact-check associé',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional() // Indique clairement que le champ est facultatif
  // Si fact_check_id est censé être un UUID, il est bon d'ajouter la validation
  @IsUUID('4', { message: 'fact_check_id doit être un UUID valide' }) 
  fact_check_id!: string; 
}