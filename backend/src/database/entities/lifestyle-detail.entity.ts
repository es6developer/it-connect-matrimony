import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, Index,
} from 'typeorm';
import { Diet, Smoking, Drinking } from '../../common/enums';
import { User } from './user.entity';

@Entity('lifestyle_details')
export class LifestyleDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'enum', enum: Diet, nullable: true })
  diet: Diet | null;

  @Index()
  @Column({ type: 'enum', enum: Smoking, nullable: true })
  smoking: Smoking | null;

  @Index()
  @Column({ type: 'enum', enum: Drinking, nullable: true })
  drinking: Drinking | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  exerciseFrequency: string | null;

  @Column({ type: 'json', nullable: true })
  hobbies: object | null;

  @Column({ type: 'json', nullable: true })
  interests: object | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fitnessRoutine: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sleepingHabits: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.lifestyleDetail, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
