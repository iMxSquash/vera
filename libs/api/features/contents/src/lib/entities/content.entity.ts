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

  @Column({
    type: 'enum',
    enum: ContentPlatform,
  })
  platform!: ContentPlatform;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'text', nullable: true })
  text!: string;

  @Column({ type: 'json', nullable: true })
  media!: Record<string, unknown>; // Pour stocker les métadonnées des médias (images, vidéos)

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, unknown>; // Métadonnées supplémentaires (auteur, date, etc.)

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.PENDING,
  })
  status!: ContentStatus;

  @Column({ type: 'text', nullable: true })
  verification_result!: string;

  @Column({ type: 'uuid', nullable: true })
  fact_check_id!: string; // Référence vers la vérification fact-check associée

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}