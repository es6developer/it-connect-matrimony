import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { SubscriptionStatus, PlanType } from '../../common/enums';
import { User } from './user.entity';
import { Payment } from './payment.entity';
import { CouponRedemption } from './coupon-redemption.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'enum', enum: PlanType, default: PlanType.FREE })
  planType: PlanType;

  @Index()
  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Column({ type: 'date', nullable: true })
  startDate: string | null;

  @Column({ type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'boolean', default: false })
  autoRenew: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number | null;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentGateway: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentId: string | null;

  @Column({ type: 'json', nullable: true })
  features: object | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];

  @OneToMany(() => CouponRedemption, (cr) => cr.subscription)
  couponRedemptions: CouponRedemption[];
}
