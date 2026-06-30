import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('faqs')
export class FAQ {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'longtext' })
  answer: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Index()
  @Column({ type: 'int', unsigned: true, default: 0 })
  order: number;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
