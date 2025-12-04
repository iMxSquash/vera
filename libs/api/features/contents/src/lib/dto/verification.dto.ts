import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class VerificationDto {
  @ApiProperty({
    description: 'Résultat de la vérification (description du verdict)',
    example: 'Le contenu a été vérifié et jugé trompeur.',
  })
  @IsString()
  @IsNotEmpty()
  verificationResult!: string;

  @ApiPropertyOptional({
    description: 'ID du fact-check (lien vers l\'article de vérification) associé. Doit être un UUID valide.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'factCheckId doit être un UUID valide (v4)' })
  factCheckId?: string;
}