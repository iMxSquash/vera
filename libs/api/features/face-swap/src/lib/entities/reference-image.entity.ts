import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('reference_images')
export class ReferenceImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  supabaseUrl!: string;

  @Column({ type: 'varchar', length: 100 })
  bucketName!: string;

  @Column({ type: 'varchar', length: 500 })
  filePath!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
