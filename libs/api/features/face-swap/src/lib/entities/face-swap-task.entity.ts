import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReferenceImageEntity } from './reference-image.entity';

export enum FaceSwapStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  STAGED = 'Staged',
}

@Entity('face_swap_tasks')
export class FaceSwapTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  taskId?: string;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;

  @Column({
    type: 'enum',
    enum: FaceSwapStatus,
    default: FaceSwapStatus.PENDING,
  })
  status!: FaceSwapStatus;

  @Column({ type: 'varchar', length: 500 })
  inputImageUrl!: string;

  @Column({ type: 'uuid', nullable: true })
  referenceImageId?: string;

  @ManyToOne(() => ReferenceImageEntity, { nullable: true })
  @JoinColumn({ name: 'referenceImageId' })
  referenceImage?: ReferenceImageEntity;

  @Column({ type: 'varchar', length: 500, nullable: true })
  outputImageUrl?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
