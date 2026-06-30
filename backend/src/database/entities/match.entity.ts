import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  matchedUserId: number;

  @Index()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  compatibilityScore: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiScore: number | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  isMutual: boolean;

  @Column({ type: 'timestamp', nullable: true })
  matchedAt: Date | null;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.matches, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.matchedWith, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'matched_user_id' })
  matchedUser: User;
}
