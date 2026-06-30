import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Coupon } from './coupon.entity';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';
import { Payment } from './payment.entity';

@Entity('coupon_redemptions')
export class CouponRedemption {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  couponId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  subscriptionId: number | null;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  paymentId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Coupon, (coupon) => coupon.redemptions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @ManyToOne(() => User, (user) => user.couponRedemptions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Subscription, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription | null;

  @ManyToOne(() => Payment, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment | null;
}
