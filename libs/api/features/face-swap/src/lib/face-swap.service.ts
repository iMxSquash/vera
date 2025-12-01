import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ReferenceImageEntity,
} from './entities/reference-image.entity';
import {
  FaceSwapTaskEntity,
  FaceSwapStatus,
} from './entities/face-swap-task.entity';
import { FaceSwapResponseDto } from './dto/face-swap-response.dto';
import { SupabaseService } from '@vera/api/shared/data-access';

@Injectable()
export class FaceSwapService {
  private readonly piApiUrl: string;
  private readonly piApiKey: string;

  constructor(
    @InjectRepository(ReferenceImageEntity)
    private readonly referenceImageRepo: Repository<ReferenceImageEntity>,
    @InjectRepository(FaceSwapTaskEntity)
    private readonly faceSwapTaskRepo: Repository<FaceSwapTaskEntity>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService
  ) {
    this.piApiUrl =
      this.configService.get<string>('PIAPI_BASE_URL') ||
      'https://api.piapi.ai/api/v1';
    this.piApiKey = this.configService.get<string>('PIAPI_API_KEY') || '';
  }

  async uploadImageToSupabase(
    file: Express.Multer.File,
    bucket = 'face-swap-uploads'
  ): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload image to Supabase: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  }

  async getRandomReferenceImage(): Promise<ReferenceImageEntity> {
    const count = await this.referenceImageRepo.count({
      where: { isActive: true },
    });

    if (count === 0) {
      throw new NotFoundException('No active reference images available');
    }

    const randomIndex = Math.floor(Math.random() * count);

    const images = await this.referenceImageRepo.find({
      where: { isActive: true },
      skip: randomIndex,
      take: 1,
    });

    return images[0];
  }

  async createFaceSwapTask(
    userId: string,
    inputImage: Express.Multer.File
  ): Promise<FaceSwapResponseDto> {
    // Upload input image to Supabase
    const inputImageUrl = await this.uploadImageToSupabase(inputImage);

    // Get random reference image
    const referenceImage = await this.getRandomReferenceImage();

    // Create task entity
    const task = this.faceSwapTaskRepo.create({
      userId,
      inputImageUrl,
      referenceImageId: referenceImage.id,
      status: FaceSwapStatus.PENDING,
    });

    await this.faceSwapTaskRepo.save(task);

    // Call PiAPI to start face swap
    try {
      const requestBody = {
        model: 'Qubico/image-toolkit',
        task_type: 'face-swap',
        input: {
          target_image: referenceImage.supabaseUrl,
          swap_image: inputImageUrl,
        },
        config: {
          service_mode: 'public',
        },
      };

      console.log('🔄 Calling PiAPI with:', JSON.stringify(requestBody, null, 2));
      console.log('🔑 Using API Key:', this.piApiKey ? `${this.piApiKey.substring(0, 10)}...` : 'NOT SET');

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.piApiUrl}/task`,
          requestBody,
          {
            headers: {
              'x-api-key': this.piApiKey,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      console.log('✅ PiAPI Response:', response.data);

      const { task_id, status } = response.data.data;

      // Update task with PiAPI task ID and status
      task.taskId = task_id;
      task.status = this.mapPiApiStatus(status);

      await this.faceSwapTaskRepo.save(task);

      // Start polling for completion (async)
      this.pollTaskCompletion(task.id, task_id);

      return this.mapToResponseDto(task);
    } catch (error: unknown) {
      console.error('❌ PiAPI Error:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Error Status:', axiosError.response?.status);
        console.error('Error Data:', JSON.stringify(axiosError.response?.data, null, 2));
      }

      task.status = FaceSwapStatus.FAILED;
      task.errorMessage = error instanceof Error ? error.message : 'Failed to create face swap task';
      await this.faceSwapTaskRepo.save(task);

      throw error;
    }
  }

  private async downloadAndUploadImage(imageUrl: string): Promise<string> {
    try {
      // Download image from PiAPI
      const response = await firstValueFrom(
        this.httpService.get(imageUrl, { responseType: 'arraybuffer' })
      );

      // Create a buffer from the response
      const buffer = Buffer.from(response.data);

      // Generate a unique filename
      const fileName = `${Date.now()}-faceswap-result.jpg`;
      const filePath = `outputs/${fileName}`;

      // Upload to Supabase
      const supabase = this.supabaseService.getAdminClient();
      const { error } = await supabase.storage
        .from('face-swap-uploads')
        .upload(filePath, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Failed to upload output image to Supabase:', error);
        // Return original URL if upload fails
        return imageUrl;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('face-swap-uploads').getPublicUrl(filePath);

      console.log('✅ Output image uploaded to Supabase:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error downloading/uploading image:', error);
      // Return original URL if download/upload fails
      return imageUrl;
    }
  }

  private async pollTaskCompletion(
    taskId: string,
    piApiTaskId: string
  ): Promise<void> {
    const maxAttempts = 60; // 5 minutes max (5s intervals)
    let attempts = 0;

    console.log(`🔁 Starting polling for task ${taskId} (PiAPI: ${piApiTaskId})`);

    const poll = async () => {
      try {
        attempts++;
        console.log(`🔍 Polling attempt ${attempts}/${maxAttempts} for task ${taskId}`);

        const task = await this.faceSwapTaskRepo.findOne({
          where: { id: taskId },
        });

        if (!task) {
          console.error(`❌ Task ${taskId} not found in database`);
          return;
        }

        if (
          task.status === FaceSwapStatus.COMPLETED ||
          task.status === FaceSwapStatus.FAILED
        ) {
          console.log(`✅ Task ${taskId} already finished with status: ${task.status}`);
          return;
        }

        const status = await this.checkTaskStatus(piApiTaskId);
        console.log(`📊 PiAPI status for ${piApiTaskId}:`, status.status);

        task.status = this.mapPiApiStatus(status.status);

        if (status.status.toLowerCase() === 'completed' && status.output) {
          const piApiImageUrl =
            status.output.image_url || status.output.output;
          
          if (piApiImageUrl) {
            // Download from PiAPI and upload to Supabase
            console.log('📥 Downloading output image from PiAPI...');
            task.outputImageUrl = await this.downloadAndUploadImage(piApiImageUrl);
            console.log('✅ Task completed and image uploaded!');
          } else {
            console.error('⚠️ No output image URL found in PiAPI response');
            task.errorMessage = 'No output image URL in response';
          }
        } else if (status.status.toLowerCase() === 'failed') {
          task.errorMessage =
            status.error?.message || 'Task failed on PiAPI';
          console.error(`❌ Task failed: ${task.errorMessage}`);
        }

        await this.faceSwapTaskRepo.save(task);

        if (
          task.status !== FaceSwapStatus.COMPLETED &&
          task.status !== FaceSwapStatus.FAILED &&
          attempts < maxAttempts
        ) {
          console.log(`⏳ Task still ${task.status}, will poll again in 5s...`);
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else if (attempts >= maxAttempts) {
          console.error(`⏱️ Max polling attempts reached for task ${taskId}`);
        }
      } catch (error) {
        console.error(`❌ Error polling task status for ${taskId}:`, error);
      }
    };

    setTimeout(poll, 5000); // Start polling after 5 seconds
  }

  async checkTaskStatus(taskId: string): Promise<{
    status: string;
    output?: { image_url?: string; output?: string };
    error?: { message?: string };
  }> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.piApiUrl}/task/${taskId}`, {
        headers: {
          'x-api-key': this.piApiKey,
        },
      })
    );

    return response.data.data;
  }

  private mapPiApiStatus(piApiStatus: string): FaceSwapStatus {
    switch (piApiStatus.toLowerCase()) {
      case 'completed':
        return FaceSwapStatus.COMPLETED;
      case 'failed':
        return FaceSwapStatus.FAILED;
      case 'processing':
        return FaceSwapStatus.PROCESSING;
      case 'staged':
        return FaceSwapStatus.STAGED;
      case 'pending':
      default:
        return FaceSwapStatus.PENDING;
    }
  }

  async getFaceSwapById(id: string): Promise<FaceSwapResponseDto> {
    const task = await this.faceSwapTaskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Face swap task with ID ${id} not found`);
    }

    return this.mapToResponseDto(task);
  }

  async refreshTaskStatus(id: string): Promise<FaceSwapResponseDto> {
    const task = await this.faceSwapTaskRepo.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Face swap task with ID ${id} not found`);
    }

    // If task is already completed or failed, just return it
    if (
      task.status === FaceSwapStatus.COMPLETED ||
      task.status === FaceSwapStatus.FAILED
    ) {
      return this.mapToResponseDto(task);
    }

    // Check status from PiAPI
    if (!task.taskId) {
      throw new Error('Task does not have a PiAPI task ID');
    }

    console.log(`🔄 Manually refreshing status for task ${id} (PiAPI: ${task.taskId})`);

    try {
      const status = await this.checkTaskStatus(task.taskId);
      
      console.log('📊 PiAPI Status:', status);

      task.status = this.mapPiApiStatus(status.status);

      if (status.status.toLowerCase() === 'completed' && status.output) {
        const piApiImageUrl = status.output.image_url || status.output.output;

        if (piApiImageUrl) {
          console.log('📥 Downloading output image from PiAPI...');
          task.outputImageUrl = await this.downloadAndUploadImage(piApiImageUrl);
        } else {
          console.error('⚠️ No output image URL found in PiAPI response');
          task.errorMessage = 'No output image URL in response';
        }
      } else if (status.status.toLowerCase() === 'failed') {
        task.errorMessage = status.error?.message || 'Task failed on PiAPI';
      }

      await this.faceSwapTaskRepo.save(task);

      return this.mapToResponseDto(task);
    } catch (error) {
      console.error('Error refreshing task status:', error);
      throw error;
    }
  }

  async createReferenceImage(
    file: Express.Multer.File
  ): Promise<ReferenceImageEntity> {
    const bucketName = 'reference-images';
    const url = await this.uploadImageToSupabase(file, bucketName);
    const filePath = url.split('/').pop() || '';

    const referenceImage = this.referenceImageRepo.create({
      supabaseUrl: url,
      bucketName,
      filePath,
      isActive: true,
    });

    return this.referenceImageRepo.save(referenceImage);
  }

  async getAllReferenceImages(): Promise<ReferenceImageEntity[]> {
    return this.referenceImageRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deleteReferenceImage(id: string): Promise<void> {
    const image = await this.referenceImageRepo.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Reference image with ID ${id} not found`);
    }

    // Delete from Supabase storage
    const supabase = this.supabaseService.getAdminClient();
    const filePath = image.supabaseUrl.split('/').slice(-2).join('/');

    await supabase.storage.from(image.bucketName).remove([filePath]);

    // Delete from database
    await this.referenceImageRepo.delete(id);
  }

  async toggleReferenceImageStatus(id: string): Promise<ReferenceImageEntity> {
    const image = await this.referenceImageRepo.findOne({ where: { id } });

    if (!image) {
      throw new NotFoundException(`Reference image with ID ${id} not found`);
    }

    image.isActive = !image.isActive;
    return this.referenceImageRepo.save(image);
  }

  private mapToResponseDto(task: FaceSwapTaskEntity): FaceSwapResponseDto {
    return {
      id: task.id,
      taskId: task.taskId,
      status: task.status,
      inputImageUrl: task.inputImageUrl,
      outputImageUrl: task.outputImageUrl,
      errorMessage: task.errorMessage,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
