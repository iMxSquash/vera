import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum FactCheckStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('fact_checks')
export class FactCheckEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  userId!: string;

  @Column({ type: 'text' })
  query!: string;

  @Column({ type: 'text', nullable: true })
  response?: string;

  @Column({
    type: 'enum',
    enum: FactCheckStatus,
    default: FactCheckStatus.PENDING,
  })
  status!: FactCheckStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
