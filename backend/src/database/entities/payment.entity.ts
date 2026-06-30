import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { PaymentStatus, PaymentGateway } from '../../common/enums';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Index({ unique: true })
  @Column({ type: 'char', length: 36 })
  uuid: string;

  @Index()
  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @Index()
  @Column({ type: 'bigint', unsigned: true, nullable: true })
  subscriptionId: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @Index()
  @Column({ type: 'enum', enum: PaymentGateway })
  gateway: PaymentGateway;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayPaymentId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayOrderId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewaySignature: string | null;

  @Index()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  invoiceUrl: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  receiptUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  metadata: object | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refundId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundAmount: number | null;

  @Column({ type: 'text', nullable: true })
  refundReason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Subscription, (sub) => sub.payments, { nullable: true, onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription | null;
}
