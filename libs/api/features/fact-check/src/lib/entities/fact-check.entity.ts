import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('fact_checks')
export class FactCheckEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'text' })
  query!: string;

  @Column({ type: 'text', nullable: true })
  response?: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: 'pending' | 'completed' | 'failed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
