import { IsNotEmpty, IsString, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePollDto {
  @ApiProperty({ example: 'Do you like pizza?', description: 'Poll question' })
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiProperty({ example: ['Yes', 'No'], description: 'Poll options (2-4)' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  options!: string[];
}
