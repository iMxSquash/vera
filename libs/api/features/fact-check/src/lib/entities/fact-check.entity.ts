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

/**
 * FACT CHECK ENTITY
 */
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

/**
 * IMAGE ENTITY
 */
@Entity('images')
export class ImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  filename!: string;

  @Column({ type: 'varchar', length: 500 })
  path!: string;

  @Column({ type: 'varchar', length: 100 })
  mimetype!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ type: 'text', nullable: true })
  geminiDescription?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
