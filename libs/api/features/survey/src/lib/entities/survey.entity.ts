import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('survey')
export class Survey {

  @PrimaryGeneratedColumn('uuid') 
  id?: string;

  @Column()
  q1!: string;

  @CreateDateColumn()
  created_at!: Date;
}
