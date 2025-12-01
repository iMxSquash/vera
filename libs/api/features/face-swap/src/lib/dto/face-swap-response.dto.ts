import { FaceSwapStatus } from '../entities/face-swap-task.entity';

export class FaceSwapResponseDto {
  id!: string;
  taskId?: string;
  status!: FaceSwapStatus;
  inputImageUrl!: string;
  outputImageUrl?: string;
  errorMessage?: string;
  createdAt!: Date;
  updatedAt!: Date;
}
