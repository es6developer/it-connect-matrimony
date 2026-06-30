import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  adminId: number | null;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  action: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  resourceType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  resourceId: number | null;

  @Column({ type: 'json', nullable: true })
  oldValues: object | null;

  @Column({ type: 'json', nullable: true })
  newValues: object | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => AdminUser, (au) => au.auditLogs, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminUser | null;
}
