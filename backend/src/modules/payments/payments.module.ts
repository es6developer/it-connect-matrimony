import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { RazorpayService } from './services/razorpay.service';
import { StripeService } from './services/stripe.service';
import { Subscription } from '../../database/entities/subscription.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Coupon } from '../../database/entities/coupon.entity';
import { CouponRedemption } from '../../database/entities/coupon-redemption.entity';
import razorpayConfig from '../../config/app.config';
import stripeConfig from '../../config/app.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Payment, Coupon, CouponRedemption]),
    ConfigModule,
    ConfigModule.forFeature(razorpayConfig),
    ConfigModule.forFeature(stripeConfig),
  ],
  controllers: [
    PaymentsController,
    SubscriptionsController,
    CouponsController,
  ],
  providers: [
    PaymentsService,
    SubscriptionsService,
    CouponsService,
    RazorpayService,
    StripeService,
  ],
  exports: [
    PaymentsService,
    SubscriptionsService,
    CouponsService,
  ],
})
export class PaymentsModule {}
