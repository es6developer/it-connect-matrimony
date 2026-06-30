import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, Index,
} from 'typeorm';
import { Gender, MaritalStatus, Diet, Smoking, Drinking } from '../../common/enums';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  headline: string | null;

  @Column({ type: 'text', nullable: true })
  aboutMe: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string | null;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  age: number | null;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender | null;

  @Column({ type: 'enum', enum: MaritalStatus, nullable: true })
  maritalStatus: MaritalStatus | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  religion: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  caste: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subCaste: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  community: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  motherTongue: string | null;

  @Index()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  bodyType: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  bloodGroup: string | null;

  @Column({ type: 'varchar', length: 20, default: 'none' })
  disability: string;

  @Column({ type: 'enum', enum: Diet, nullable: true })
  diet: Diet | null;

  @Column({ type: 'enum', enum: Smoking, nullable: true })
  smoking: Smoking | null;

  @Column({ type: 'enum', enum: Drinking, nullable: true })
  drinking: Drinking | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  pincode: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number | null;

  @Column({ type: 'boolean', default: false })
  hideProfile: boolean;

  @Column({ type: 'boolean', default: false })
  hidePhotos: boolean;

  @Column({ type: 'boolean', default: false })
  hideContact: boolean;

  @Column({ type: 'boolean', default: false })
  privateMode: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
