import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  conversationId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  senderId: number;

  @Column({ type: 'longtext', nullable: true })
  content: string | null;

  @Index()
  @Column({ type: 'enum', enum: ['text', 'image', 'video', 'audio', 'document', 'location'], default: 'text' })
  messageType: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  mediaUrl: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  fileSize: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  duration: number | null;

  @Index()
  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDelivered: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDeletedForAll: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  replyToMessageId: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Conversation, (conv) => conv.messages, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'reply_to_message_id' })
  replyToMessage: Message | null;
}
