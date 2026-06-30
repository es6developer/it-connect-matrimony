import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, JoinColumn, Index,
} from 'typeorm';
import { FamilyType, FamilyStatus, FamilyValues } from '../../common/enums';
import { User } from './user.entity';

@Entity('family_details')
export class FamilyDetail {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fatherName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fatherOccupation: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  motherName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motherOccupation: string | null;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  siblingsCount: number | null;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  brotherCount: number | null;

  @Column({ type: 'tinyint', unsigned: true, nullable: true })
  sisterCount: number | null;

  @Column({ type: 'enum', enum: FamilyType, nullable: true })
  familyType: FamilyType | null;

  @Column({ type: 'enum', enum: FamilyStatus, nullable: true })
  familyStatus: FamilyStatus | null;

  @Column({ type: 'enum', enum: FamilyValues, nullable: true })
  familyValues: FamilyValues | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  familyLocation: string | null;

  @Column({ type: 'text', nullable: true })
  aboutFamily: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.familyDetail, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
