import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyExternalFactDto {
  @ApiProperty({ example: 'test-user-123', description: 'User identifier' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'Is climate change real?', description: 'Fact to verify' })
  @IsString()
  @IsNotEmpty()
  query!: string;
}
