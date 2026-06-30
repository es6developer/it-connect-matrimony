import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('partner_preferences')
export class PartnerPreference {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  ageMin: number | null;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  ageMax: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heightMin: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heightMax: number | null;

  @Column({ type: 'json', nullable: true })
  maritalStatus: object | null;

  @Column({ type: 'json', nullable: true })
  religion: object | null;

  @Column({ type: 'json', nullable: true })
  caste: object | null;

  @Column({ type: 'json', nullable: true })
  community: object | null;

  @Column({ type: 'json', nullable: true })
  motherTongue: object | null;

  @Column({ type: 'json', nullable: true })
  country: object | null;

  @Column({ type: 'json', nullable: true })
  state: object | null;

  @Column({ type: 'json', nullable: true })
  city: object | null;

  @Column({ type: 'json', nullable: true })
  education: object | null;

  @Column({ type: 'json', nullable: true })
  occupation: object | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minIncome: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxIncome: number | null;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'json', nullable: true })
  workMode: object | null;

  @Column({ type: 'json', nullable: true })
  technologyStack: object | null;

  @Column({ type: 'json', nullable: true })
  diet: object | null;

  @Column({ type: 'json', nullable: true })
  smoking: object | null;

  @Column({ type: 'json', nullable: true })
  drinking: object | null;

  @Column({ type: 'enum', enum: ['yes', 'no', 'any', 'unknown'], default: 'any' })
  manglik: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.partnerPreference, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
