import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('photos')
export class Photo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 2048 })
  url: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Index()
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean;

  @Index()
  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  verificationStatus: string;

  @Column({ type: 'text', nullable: true })
  moderationNote: string | null;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  aiSafetyScore: number | null;

  @Index()
  @Column({ type: 'int', unsigned: true, default: 0 })
  uploadOrder: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  fileSize: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mimeType: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.photos, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
