import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly webhookSecret: string;
  private razorpay: any = null;

  constructor(private readonly configService: ConfigService) {
    this.webhookSecret = this.configService.get<string>('razorpay.webhookSecret', '');
    const keyId = this.configService.get<string>('razorpay.keyId', '');
    const keySecret = this.configService.get<string>('razorpay.keySecret', '');
    if (keyId && keySecret) {
      const Razorpay = require('razorpay');
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    } else {
      this.logger.warn('Razorpay key not configured. Payment operations will fail.');
    }
  }

  async createOrder(amount: number, currency: string, receipt: string): Promise<{ id: string; amount: number; currency: string }> {
    try {
      if (!this.razorpay) throw new Error('Razorpay not configured');
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount),
        currency: currency.toUpperCase(),
        receipt,
        payment_capture: true,
      });
      return { id: order.id, amount: Number(order.amount), currency: order.currency };
    } catch (error: any) {
      this.logger.error(`Razorpay createOrder failed: ${error.message}`, error.stack);
      throw new Error(`Payment order creation failed: ${error.message}`);
    }
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = createHmac('sha256', this.configService.get<string>('razorpay.keySecret', ''))
      .update(body)
      .digest('hex');
    return expectedSignature === signature;
  }

  verifyWebhook(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Razorpay webhook secret not configured');
      return false;
    }
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  async createRefund(paymentId: string, amount?: number): Promise<{ refundId: string; status: string }> {
    try {
      if (!this.razorpay) throw new Error('Razorpay not configured');
      const refund = await this.razorpay.payments.refund(paymentId, {
        ...(amount ? { amount: Math.round(amount) } : {}),
      });
      return { refundId: refund.id, status: refund.status };
    } catch (error: any) {
      this.logger.error(`Razorpay refund failed: ${error.message}`, error.stack);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}
