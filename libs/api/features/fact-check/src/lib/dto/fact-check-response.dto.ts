import { ApiProperty } from '@nestjs/swagger';

export class FactCheckResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the fact-check',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id!: string;

  @ApiProperty({
    description: 'User ID who made the request',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: String,
  })
  userId!: string;

  @ApiProperty({
    description: 'The original query or claim',
    example: 'Is the Earth flat?',
    type: String,
  })
  query!: string;

  @ApiProperty({
    description: 'The verification response from Vera API',
    example: 'No, the Earth is approximately spherical...',
    type: String,
    nullable: true,
  })
  response?: string;

  @ApiProperty({
    description: 'Status of the fact-check',
    example: 'completed',
    enum: ['pending', 'completed', 'failed'],
    type: String,
  })
  status!: 'pending' | 'completed' | 'failed';

  @ApiProperty({
    description: 'When the fact-check was created',
    example: '2025-11-24T10:00:00.000Z',
    type: String,
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'When the fact-check was last updated',
    example: '2025-11-24T10:05:00.000Z',
    type: String,
  })
  updatedAt!: Date;
}
