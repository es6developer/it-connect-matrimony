import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('stripe.secretKey', ''), {
      apiVersion: '2024-06-20',
    });
    this.webhookSecret = this.configService.get<string>('stripe.webhookSecret', '');
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId?: string,
  ): Promise<{ id: string; clientSecret: string; amount: number; currency: string }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: currency.toLowerCase(),
        ...(customerId ? { customer: customerId } : {}),
        automatic_payment_methods: { enabled: true },
      });
      const clientSecret: string = paymentIntent.client_secret ?? '';
      return {
        id: paymentIntent.id,
        clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error: any) {
      this.logger.error(`Stripe createPaymentIntent failed: ${error.message}`, error.stack);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  verifyWebhook(payload: string, signature: string): Stripe.Event {
    if (!this.webhookSecret) {
      this.logger.warn('Stripe webhook secret not configured');
      throw new Error('Webhook secret not configured');
    }
    try {
      return this.stripe.webhooks.constructEvent(payload as string | Buffer, signature, this.webhookSecret);
    } catch (error: any) {
      this.logger.error(`Stripe webhook verification failed: ${error.message}`, error.stack);
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
  }

  async createRefund(paymentIntentId: string, amount?: number): Promise<{ refundId: string; status: string }> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount ? { amount: Math.round(amount) } : {}),
      });
      return { refundId: refund.id, status: refund.status ?? 'pending' };
    } catch (error: any) {
      this.logger.error(`Stripe refund failed: ${error.message}`, error.stack);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}
