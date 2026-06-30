import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { UserRole } from '../../common/enums';
import { User } from './user.entity';
import { AuditLog } from './audit-log.entity';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index({ unique: true })
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @Column({ type: 'json', nullable: true })
  permissions: object | null;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.adminUser, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => AuditLog, (al) => al.admin)
  auditLogs: AuditLog[];
}
