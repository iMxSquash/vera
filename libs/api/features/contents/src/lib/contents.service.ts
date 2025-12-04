import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentPlatform, ContentStatus } from './entities/content.entity';
import { CreateContentDto, UpdateContentDto } from './dto';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create({
      ...createContentDto,
      status: ContentStatus.PENDING,
    });
    return this.contentRepository.save(content);
  }

  async findAll(): Promise<Content[]> {
    return this.contentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({ where: { id } });
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  async findByPlatform(platform: ContentPlatform): Promise<Content[]> {
    return this.contentRepository.find({
      where: { platform },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: ContentStatus): Promise<Content[]> {
    return this.contentRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    await this.findById(id); // Vérifie l'existence
    await this.contentRepository.update(id, updateContentDto);
    return this.findById(id);
  }

  async markAsVerified(id: string, verificationResult: string, factCheckId?: string): Promise<Content> {
    return this.update(id, {
      status: ContentStatus.VERIFIED,
      verification_result: verificationResult,
      fact_check_id: factCheckId,
    });
  }

  async markAsFailed(id: string, errorMessage: string): Promise<Content> {
    return this.update(id, {
      status: ContentStatus.FAILED,
      verification_result: errorMessage,
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.contentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
  }

  async getStats(): Promise<{
    total: number;
    byPlatform: Record<ContentPlatform, number>;
    byStatus: Record<ContentStatus, number>;
  }> {
    const contents = await this.contentRepository.find();

    const byPlatform = contents.reduce((acc, content) => {
      acc[content.platform] = (acc[content.platform] || 0) + 1;
      return acc;
    }, {} as Record<ContentPlatform, number>);

    const byStatus = contents.reduce((acc, content) => {
      acc[content.status] = (acc[content.status] || 0) + 1;
      return acc;
    }, {} as Record<ContentStatus, number>);

    return {
      total: contents.length,
      byPlatform,
      byStatus,
    };
  }
}