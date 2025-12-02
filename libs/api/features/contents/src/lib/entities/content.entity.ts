import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ContentPlatform {
  TIKTOK = 'tiktok',
  TELEGRAM = 'telegram',
}

export enum ContentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

@Entity('contents')
export class Content {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ContentPlatform })
  platform!: ContentPlatform;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'text', nullable: true, default: null })
  text!: string | null;

  @Column({ type: 'json', nullable: true, default: {} })
  media!: Record<string, unknown>;

  @Column({ type: 'json', nullable: true, default: {} })
  metadata!: Record<string, unknown>;

  @Column({ type: 'enum', enum: ContentStatus, default: ContentStatus.PENDING })
  status!: ContentStatus;

  @Column({ type: 'text', nullable: true, default: null })
  verification_result!: string | null;

  @Column({ type: 'uuid', nullable: true })
  fact_check_id!: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}
