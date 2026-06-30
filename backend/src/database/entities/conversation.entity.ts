import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'enum', enum: ['direct', 'group'], default: 'direct' })
  type: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdConversations, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => ConversationParticipant, (cp) => cp.conversation)
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (msg) => msg.conversation)
  messages: Message[];
}
