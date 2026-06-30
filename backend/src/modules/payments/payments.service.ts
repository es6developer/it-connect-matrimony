import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../../database/entities/payment.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { PaymentStatus, SubscriptionStatus, PaymentGateway } from '../../common/enums';
import { RazorpayService } from './services/razorpay.service';
import { StripeService } from './services/stripe.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    private readonly razorpayService: RazorpayService,
    private readonly stripeService: StripeService,
  ) {}

  async createOrder(amount: number, currency: string, userId: number, description?: string) {
    const receipt = `rcpt_${uuidv4().replace(/-/g, '').slice(0, 16)}`;

    const payment = this.paymentRepo.create({
      uuid: uuidv4(),
      userId,
      amount,
      currency: currency || 'INR',
      status: PaymentStatus.PENDING,
      description: description || null,
    });
    const saved = await this.paymentRepo.save(payment);

    return { paymentId: saved.id, uuid: saved.uuid, receipt };
  }

  async verifyPayment(gateway: PaymentGateway, paymentId: string, orderId: string, signature?: string) {
    const payment = await this.paymentRepo.findOne({
      where: { gatewayOrderId: orderId },
      relations: ['subscription'],
    });
    if (!payment) throw new NotFoundException('Payment order not found');
    if (payment.status !== PaymentStatus.PENDING)
      throw new BadRequestException('Payment is not in pending state');

    let isValid = false;

    if (gateway === PaymentGateway.RAZORPAY) {
      if (!signature) throw new BadRequestException('Signature is required for Razorpay verification');
      isValid = this.razorpayService.verifyPayment(orderId, paymentId, signature);
    } else if (gateway === PaymentGateway.STRIPE) {
      isValid = true;
    } else {
      throw new BadRequestException('Unsupported payment gateway');
    }

    if (!isValid) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);
      throw new BadRequestException('Payment verification failed');
    }

    payment.gateway = gateway;
    payment.gatewayPaymentId = paymentId;
    payment.gatewayOrderId = orderId;
    payment.gatewaySignature = signature || null;
    payment.status = PaymentStatus.SUCCESS;

    await this.paymentRepo.save(payment);

    if (payment.subscription) {
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      payment.subscription.status = SubscriptionStatus.ACTIVE;
      payment.subscription.startDate = now.toISOString().split('T')[0];
      payment.subscription.endDate = endDate.toISOString().split('T')[0];
      payment.subscription.paymentId = paymentId;
      await this.subRepo.save(payment.subscription);
    }

    return { success: true, message: 'Payment verified successfully', paymentId: payment.id };
  }

  async handleWebhook(gateway: PaymentGateway, payload: any, rawBody: string, signature?: string) {
    if (gateway === PaymentGateway.RAZORPAY) {
      if (!signature) throw new BadRequestException('Missing webhook signature');
      const isValid = this.razorpayService.verifyWebhook(rawBody, signature);
      if (!isValid) throw new BadRequestException('Invalid webhook signature');

      const event = payload.event;
      this.logger.log(`Razorpay webhook event: ${event}`);

      if (event === 'payment.captured' || event === 'payment.authorized') {
        const razorpayPayment = payload.payload?.payment?.entity;
        if (razorpayPayment) {
          const payment = await this.paymentRepo.findOne({
            where: { gatewayOrderId: razorpayPayment.order_id },
            relations: ['subscription'],
          });
          if (payment) {
            payment.gateway = PaymentGateway.RAZORPAY;
            payment.gatewayPaymentId = razorpayPayment.id;
            payment.status = PaymentStatus.SUCCESS;

            if (payment.subscription) {
              const now = new Date();
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + 30);
              payment.subscription.status = SubscriptionStatus.ACTIVE;
              payment.subscription.startDate = now.toISOString().split('T')[0];
              payment.subscription.endDate = endDate.toISOString().split('T')[0];
              payment.subscription.paymentId = razorpayPayment.id;
              await this.subRepo.save(payment.subscription);
            }
            await this.paymentRepo.save(payment);
          }
        }
      }
    } else if (gateway === PaymentGateway.STRIPE) {
      if (!signature) throw new BadRequestException('Missing webhook signature');
      const event = this.stripeService.verifyWebhook(rawBody, signature);

      this.logger.log(`Stripe webhook event: ${event.type}`);

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as any;
        const payment = await this.paymentRepo.findOne({
          where: { gatewayOrderId: intent.id },
          relations: ['subscription'],
        });
        if (payment) {
          payment.gateway = PaymentGateway.STRIPE;
          payment.gatewayPaymentId = intent.id;
          payment.status = PaymentStatus.SUCCESS;

          if (payment.subscription) {
            const now = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            payment.subscription.status = SubscriptionStatus.ACTIVE;
            payment.subscription.startDate = now.toISOString().split('T')[0];
            payment.subscription.endDate = endDate.toISOString().split('T')[0];
            payment.subscription.paymentId = intent.id;
            await this.subRepo.save(payment.subscription);
          }
          await this.paymentRepo.save(payment);
        }
      }
    } else {
      throw new BadRequestException('Unsupported payment gateway');
    }

    return { received: true };
  }

  async getPayment(id: number, userId: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id, userId },
      relations: ['subscription'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async requestRefund(paymentId: number, userId: number, reason?: string) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId, userId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.SUCCESS)
      throw new BadRequestException('Only successful payments can be refunded');
    if (payment.refundId)
      throw new BadRequestException('Refund already initiated for this payment');

    let refundResult: { refundId: string; status: string };

    const gatewayPaymentId = payment.gatewayPaymentId;
    if (!gatewayPaymentId) throw new BadRequestException('No gateway payment ID found');

    if (payment.gateway === PaymentGateway.RAZORPAY) {
      refundResult = await this.razorpayService.createRefund(
        gatewayPaymentId,
        undefined,
      );
    } else if (payment.gateway === PaymentGateway.STRIPE) {
      refundResult = await this.stripeService.createRefund(
        gatewayPaymentId,
        undefined,
      );
    } else {
      throw new BadRequestException('Unsupported payment gateway');
    }

    payment.refundId = refundResult.refundId;
    payment.refundAmount = payment.amount;
    payment.refundReason = reason || null;
    payment.refundedAt = new Date();
    payment.status = PaymentStatus.REFUNDED;

    await this.paymentRepo.save(payment);

    return {
      refundId: refundResult.refundId,
      status: refundResult.status,
      paymentId: payment.id,
    };
  }
}
