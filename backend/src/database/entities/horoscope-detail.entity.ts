import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('horoscope_details')
export class HoroscopeDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  birthPlace: string | null;

  @Column({ type: 'time', nullable: true })
  birthTime: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  rashi: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  nakshatra: string | null;

  @Index()
  @Column({ type: 'enum', enum: ['yes', 'no', 'unknown'], default: 'unknown' })
  manglik: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gotra: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  kundaliFile: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.horoscopeDetail, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
