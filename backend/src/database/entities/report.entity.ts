import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  reporterId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  reportedUserId: number;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  evidenceUrls: object | null;

  @Index()
  @Column({ type: 'enum', enum: ['pending', 'investigated', 'resolved', 'dismissed'], default: 'pending' })
  status: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  assignedTo: number | null;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.filedReports, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => User, (user) => user.receivedReports, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'reported_user_id' })
  reportedUser: User;

  @ManyToOne(() => User, (user) => user.assignedReports, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'assigned_to' })
  assignedToUser: User | null;
}
