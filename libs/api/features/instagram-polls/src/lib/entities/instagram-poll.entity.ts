import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PollResponseEntity } from './poll-response.entity';

export enum PollStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
}

@Entity('instagram_polls')
export class InstagramPollEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  question!: string;

  @Column('simple-array')
  options!: string[];

  @Column({ default: 'instagram' })
  platform!: string;

  @Column({ name: 'instagram_story_id', nullable: true })
  instagramStoryId?: string;

  @Column({
    type: 'simple-enum',
    enum: PollStatus,
    default: PollStatus.DRAFT,
  })
  status!: PollStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => PollResponseEntity, (response) => response.poll)
  responses!: PollResponseEntity[];
}
