import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeImageDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Image file to analyze' })
  image: any;

  @ApiProperty({ example: 'Describe this image in detail for fact-checking purposes', description: 'Prompt for Gemini analysis' })
  prompt?: string;
}