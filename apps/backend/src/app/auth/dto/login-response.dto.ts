import { ApiProperty } from '@nestjs/swagger';

export class AdminDto {
  @ApiProperty({
    description: "ID de l'administrateur",
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: "Email de l'administrateur",
    example: 'admin@vera.com',
  })
  email: string;

  @ApiProperty({
    description: "Nom complet de l'administrateur",
    example: 'admin',
  })
  fullname: string;

  @ApiProperty({
    description: 'Date de création du compte au format ISO 8601',
    example: '2025-11-24T10:00:00.000Z',
  })
  created_at: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT pour authentification ultérieure',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImFkbWluQHZlcmEuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMyNDI3NjAwfQ.example',
  })
  access_token: string;

  @ApiProperty({
    description: "Données de l'administrateur connecté",
    type: AdminDto,
  })
  user: AdminDto;
}
