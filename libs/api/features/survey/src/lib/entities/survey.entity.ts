import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({nullable:true})
  sheetId!: string;

  @Column({nullable:true})
  title!:string;

  @Column()
  q1!: string;

  @Column()
  created_at!: Date;
}
