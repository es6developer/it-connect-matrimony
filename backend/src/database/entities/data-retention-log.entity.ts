import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('data_retention_logs')
export class DataRetentionLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  userId: number | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  dataType: string;

  @Index()
  @Column({ type: 'timestamp' })
  executedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.dataRetentionLogs, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
