import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InstagramPollsService } from './instagram-polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { JwtAuthGuard } from '@vera/api/features/auth';

@ApiTags('Instagram Polls')
@Controller('instagram-polls')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InstagramPollsController {
  constructor(private readonly pollsService: InstagramPollsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new poll' })
  @ApiResponse({ status: 201, description: 'Poll created' })
  create(@Body() createPollDto: CreatePollDto) {
    return this.pollsService.create(createPollDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all polls' })
  @ApiResponse({ status: 200, description: 'List of polls' })
  findAll() {
    return this.pollsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get poll details' })
  @ApiResponse({ status: 200, description: 'Poll details' })
  @ApiResponse({ status: 404, description: 'Poll not found' })
  async findOne(@Param('id') id: string) {
    const poll = await this.pollsService.findOne(id);
    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }
    return poll;
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish poll to Instagram' })
  @ApiResponse({ status: 200, description: 'Poll published' })
  publish(@Param('id') id: string) {
    return this.pollsService.publishToInstagram(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync responses from Instagram' })
  @ApiResponse({ status: 200, description: 'Responses synced' })
  sync(@Param('id') id: string) {
    return this.pollsService.syncResponses(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get poll statistics' })
  @ApiResponse({ status: 200, description: 'Poll statistics' })
  getStats(@Param('id') id: string) {
    return this.pollsService.getStatistics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a poll' })
  @ApiResponse({ status: 200, description: 'Poll updated' })
  update(@Param('id') id: string, @Body() updatePollDto: UpdatePollDto) {
    return this.pollsService.update(id, updatePollDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a poll' })
  @ApiResponse({ status: 200, description: 'Poll deleted' })
  delete(@Param('id') id: string) {
    return this.pollsService.delete(id);
  }
}
