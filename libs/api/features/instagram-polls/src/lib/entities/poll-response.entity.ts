import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InstagramPollEntity } from './instagram-poll.entity';

@Entity('poll_responses')
export class PollResponseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'poll_id' })
  pollId!: string;

  @Column({ name: 'user_instagram_id' })
  userInstagramId!: string;

  @Column({ name: 'selected_option' })
  selectedOption!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => InstagramPollEntity, (poll) => poll.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poll_id' })
  poll!: InstagramPollEntity;
}
