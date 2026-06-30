import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, Index,
} from 'typeorm';
import { WorkMode } from '../../common/enums';
import { User } from './user.entity';

@Entity('professional_details')
export class ProfessionalDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  currentCompany: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  designation: string | null;

  @Index()
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  yearsOfExperience: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  currentSalary: number | null;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  expectedSalary: number | null;

  @Column({ type: 'json', nullable: true })
  technologyStack: object | null;

  @Column({ type: 'json', nullable: true })
  skills: object | null;

  @Index()
  @Column({ type: 'enum', enum: WorkMode, nullable: true })
  workMode: WorkMode | null;

  @Column({ type: 'json', nullable: true })
  preferredCountries: object | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  visaStatus: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workPermit: string | null;

  @Column({ type: 'boolean', default: false })
  isStartupEmployee: boolean;

  @Column({ type: 'boolean', default: false })
  isEntrepreneur: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  startupName: string | null;

  @Column({ type: 'text', nullable: true })
  startupDescription: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  githubUrl: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  linkedinUrl: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  portfolioUrl: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  resumeUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  noticePeriod: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.professionalDetail, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
