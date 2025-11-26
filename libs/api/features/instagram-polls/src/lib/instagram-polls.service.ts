import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstagramPollEntity, PollStatus } from './entities/instagram-poll.entity';
import { PollResponseEntity } from './entities/poll-response.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';

@Injectable()
export class InstagramPollsService {
  private readonly logger = new Logger(InstagramPollsService.name);

  constructor(
    @InjectRepository(InstagramPollEntity)
    private readonly pollRepository: Repository<InstagramPollEntity>,
    @InjectRepository(PollResponseEntity)
    private readonly responseRepository: Repository<PollResponseEntity>
  ) {}

  async create(createPollDto: CreatePollDto): Promise<InstagramPollEntity> {
    const poll = this.pollRepository.create({
      ...createPollDto,
      status: PollStatus.DRAFT,
    });
    return this.pollRepository.save(poll);
  }

  async findAll(): Promise<InstagramPollEntity[]> {
    return this.pollRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<InstagramPollEntity | null> {
    return this.pollRepository.findOne({
      where: { id },
      relations: ['responses'],
    });
  }

  async publishToInstagram(id: string): Promise<InstagramPollEntity> {
    const poll = await this.findOne(id);
    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }

    // Mock Instagram API call
    this.logger.log(`Publishing poll ${id} to Instagram...`);
    // In a real implementation, we would call the Instagram API here
    // and get the story ID.
    const mockStoryId = `story_${Math.random().toString(36).substr(2, 9)}`;
    
    poll.status = PollStatus.PUBLISHED;
    poll.instagramStoryId = mockStoryId;
    
    return this.pollRepository.save(poll);
  }

  async syncResponses(id: string): Promise<void> {
    const poll = await this.findOne(id);
    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }

    if (poll.status !== PollStatus.PUBLISHED) {
      throw new Error('Poll is not published');
    }

    // Mock syncing responses
    this.logger.log(`Syncing responses for poll ${id}...`);
    
    // Simulate some random responses
    const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)];
    const response = this.responseRepository.create({
      pollId: poll.id,
      userInstagramId: `user_${Math.random().toString(36).substr(2, 9)}`,
      selectedOption: randomOption,
    });
    
    await this.responseRepository.save(response);
  }

  async update(id: string, updatePollDto: UpdatePollDto): Promise<InstagramPollEntity> {
    const poll = await this.findOne(id);
    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }
    
    // Only allow updating if draft
    if (poll.status !== PollStatus.DRAFT) {
      throw new Error('Cannot update published poll');
    }

    Object.assign(poll, updatePollDto);
    return this.pollRepository.save(poll);
  }

  async getStatistics(id: string): Promise<{ totalResponses: number; stats: Record<string, number> }> {
    const poll = await this.findOne(id);
    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }

    const totalResponses = poll.responses.length;
    const stats: Record<string, number> = {};

    poll.options.forEach(option => {
      const count = poll.responses.filter(r => r.selectedOption === option).length;
      stats[option] = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
    });

    return {
      totalResponses,
      stats,
    };
  }
  
  async delete(id: string): Promise<void> {
    await this.pollRepository.delete(id);
  }
}
