import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateReferenceImageDto {
  @IsNotEmpty()
  supabaseUrl!: string;

  @IsNotEmpty()
  bucketName!: string;

  @IsNotEmpty()
  filePath!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
