import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFactCheckDto {
  @ApiProperty({
    description: 'User ID making the fact-check request',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: 'The query or claim to verify',
    example: 'Is the Earth flat?',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  query!: string;
}
