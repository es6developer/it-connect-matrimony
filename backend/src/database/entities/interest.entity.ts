import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { InterestStatus } from '../../common/enums';
import { User } from './user.entity';

@Entity('interests')
export class Interest {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  fromUserId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  toUserId: number;

  @Index()
  @Column({ type: 'enum', enum: InterestStatus, default: InterestStatus.SENT })
  status: InterestStatus;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  actionedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.sentInterests, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'from_user_id' })
  fromUser: User;

  @ManyToOne(() => User, (user) => user.receivedInterests, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'to_user_id' })
  toUser: User;
}
