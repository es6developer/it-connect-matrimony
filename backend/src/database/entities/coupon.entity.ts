import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';
import { CouponRedemption } from './coupon-redemption.entity';

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Index()
  @Column({ type: 'enum', enum: ['percentage', 'fixed'] })
  type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  maxUses: number | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  usedCount: number;

  @Column({ type: 'datetime' })
  validFrom: Date;

  @Column({ type: 'datetime' })
  validUntil: Date;

  @Index()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  applicablePlans: object | null;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdCoupons, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => CouponRedemption, (cr) => cr.coupon)
  redemptions: CouponRedemption[];
}
