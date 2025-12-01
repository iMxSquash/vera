import { IsNotEmpty, IsString } from 'class-validator';

export class FaceSwapRequestDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
