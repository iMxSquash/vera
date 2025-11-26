import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramPollEntity } from './entities/instagram-poll.entity';
import { PollResponseEntity } from './entities/poll-response.entity';
import { InstagramPollsService } from './instagram-polls.service';
import { InstagramPollsController } from './instagram-polls.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstagramPollEntity, PollResponseEntity])],
  controllers: [InstagramPollsController],
  providers: [InstagramPollsService],
  exports: [InstagramPollsService],
})
export class FeaturesInstagramPollsModule {}
