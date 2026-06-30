import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('education_details')
export class EducationDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'varchar', length: 200, nullable: true })
  degree: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  specialization: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  university: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  college: string | null;

  @Index()
  @Column({ type: 'year', nullable: true })
  yearOfPassing: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade: string | null;

  @Column({ type: 'boolean', default: false })
  isHighestDegree: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.educationDetails, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
