import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FaceSwapService } from './face-swap.service';
import { FaceSwapRequestDto } from './dto/face-swap-request.dto';
import { JwtAuthGuard } from '@vera/api/features/auth';

@ApiTags('Face Swap')
@Controller('face-swap')
export class FaceSwapController {
  constructor(private readonly faceSwapService: FaceSwapService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload image and initiate face swap' })
  @ApiResponse({ status: 201, description: 'Face swap task created' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async uploadAndSwap(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FaceSwapRequestDto
  ) {
    if (!file) {
      throw new Error('Image file is required');
    }

    return this.faceSwapService.createFaceSwapTask(body.userId, file);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get face swap task status' })
  @ApiResponse({ status: 200, description: 'Task details retrieved' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTaskStatus(@Param('id') id: string) {
    return this.faceSwapService.getFaceSwapById(id);
  }

  @Post(':id/refresh')
  @ApiOperation({ summary: 'Manually refresh task status from PiAPI' })
  @ApiResponse({ status: 200, description: 'Task status refreshed' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async refreshTaskStatus(@Param('id') id: string) {
    return this.faceSwapService.refreshTaskStatus(id);
  }

  @Post('reference-images')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload reference image (Admin only)' })
  @ApiResponse({ status: 201, description: 'Reference image uploaded' })
  async uploadReferenceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('Image file is required');
    }

    return this.faceSwapService.createReferenceImage(file);
  }

  @Get('reference-images/list')
  @ApiOperation({ summary: 'List all reference images' })
  @ApiResponse({ status: 200, description: 'Reference images retrieved' })
  async listReferenceImages() {
    return this.faceSwapService.getAllReferenceImages();
  }

  @Delete('reference-images/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete reference image (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reference image deleted' })
  @ApiResponse({ status: 404, description: 'Reference image not found' })
  async deleteReferenceImage(@Param('id') id: string) {
    await this.faceSwapService.deleteReferenceImage(id);
    return { message: 'Reference image deleted successfully' };
  }

  @Patch('reference-images/:id/toggle')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle reference image active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reference image status toggled' })
  @ApiResponse({ status: 404, description: 'Reference image not found' })
  async toggleReferenceImageStatus(@Param('id') id: string) {
    return this.faceSwapService.toggleReferenceImageStatus(id);
  }
}
