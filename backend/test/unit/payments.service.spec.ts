import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { PaymentsService } from '../../src/modules/payments/payments.service';
import { RazorpayService } from '../../src/modules/payments/services/razorpay.service';
import { StripeService } from '../../src/modules/payments/services/stripe.service';
import { Payment } from '../../src/database/entities/payment.entity';
import { Subscription } from '../../src/database/entities/subscription.entity';
import { PaymentStatus, PaymentGateway, SubscriptionStatus } from '../../src/common/enums';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepo: any;
  let subRepo: any;
  let razorpayService: any;
  let stripeService: any;

  const mockPayment = {
    id: 1,
    uuid: 'payment-uuid',
    userId: 1,
    amount: 199900,
    currency: 'INR',
    status: PaymentStatus.PENDING,
    gateway: null,
    gatewayPaymentId: null,
    gatewayOrderId: null,
    gatewaySignature: null,
    refundId: null,
    refundAmount: null,
    refundReason: null,
    refundedAt: null,
    description: 'Premium subscription',
    subscription: null,
    createdAt: new Date(),
  };

  const mockSubscription = {
    id: 1,
    userId: 1,
    planType: 'premium',
    status: SubscriptionStatus.PENDING,
    startDate: null,
    endDate: null,
    paymentId: null,
  };

  beforeEach(async () => {
    paymentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    subRepo = {
      save: jest.fn(),
    };

    razorpayService = {
      verifyPayment: jest.fn(),
      verifyWebhook: jest.fn(),
      createRefund: jest.fn(),
    };

    stripeService = {
      verifyWebhook: jest.fn(),
      createRefund: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentRepo },
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: RazorpayService, useValue: razorpayService },
        { provide: StripeService, useValue: stripeService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('createOrder', () => {
    it('should create a pending payment order', async () => {
      paymentRepo.create.mockReturnValue(mockPayment);
      paymentRepo.save.mockResolvedValue(mockPayment);

      const result = await service.createOrder(199900, 'INR', 1, 'Premium subscription');

      expect(result).toBeDefined();
      expect(result.uuid).toBe(mockPayment.uuid);
      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          amount: 199900,
          status: PaymentStatus.PENDING,
        }),
      );
    });
  });

  describe('verifyPayment', () => {
    it('should verify a Razorpay payment and activate subscription', async () => {
      const paymentWithSub = { ...mockPayment, subscription: { ...mockSubscription } };
      paymentRepo.findOne.mockResolvedValue(paymentWithSub);
      razorpayService.verifyPayment.mockReturnValue(true);
      paymentRepo.save.mockResolvedValue({ ...paymentWithSub, status: PaymentStatus.SUCCESS });
      subRepo.save.mockResolvedValue({ ...mockSubscription, status: SubscriptionStatus.ACTIVE });

      const result = await service.verifyPayment(
        PaymentGateway.RAZORPAY,
        'pay_test',
        'order_test',
        'signature_test',
      );

      expect(result.success).toBe(true);
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.SUCCESS }),
      );
    });

    it('should throw when payment order is not found', async () => {
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.verifyPayment(PaymentGateway.RAZORPAY, 'pay_test', 'order_not_found', 'sig'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when signature is missing for Razorpay', async () => {
      paymentRepo.findOne.mockResolvedValue(mockPayment);

      await expect(
        service.verifyPayment(PaymentGateway.RAZORPAY, 'pay_test', 'order_test'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when verification fails', async () => {
      paymentRepo.findOne.mockResolvedValue(mockPayment);
      razorpayService.verifyPayment.mockReturnValue(false);

      await expect(
        service.verifyPayment(PaymentGateway.RAZORPAY, 'pay_test', 'order_test', 'bad_sig'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('should process Razorpay payment.captured webhook', async () => {
      razorpayService.verifyWebhook.mockReturnValue(true);
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook',
              order_id: 'order_webhook',
            },
          },
        },
      };

      paymentRepo.findOne.mockResolvedValue(mockPayment);
      paymentRepo.save.mockResolvedValue({ ...mockPayment, status: PaymentStatus.SUCCESS });

      const result = await service.handleWebhook(PaymentGateway.RAZORPAY, payload, 'raw_body', 'valid_sig');

      expect(result.received).toBe(true);
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.SUCCESS }),
      );
    });

    it('should process Stripe payment_intent.succeeded webhook', async () => {
      stripeService.verifyWebhook.mockReturnValue({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_webhook' } },
      });

      paymentRepo.findOne.mockResolvedValue(mockPayment);
      paymentRepo.save.mockResolvedValue({ ...mockPayment, status: PaymentStatus.SUCCESS });

      const result = await service.handleWebhook(PaymentGateway.STRIPE, {}, 'raw_body', 'valid_sig');

      expect(result.received).toBe(true);
    });

    it('should throw BadRequestException for invalid webhook signature', async () => {
      razorpayService.verifyWebhook.mockReturnValue(false);

      await expect(
        service.handleWebhook(PaymentGateway.RAZORPAY, {}, 'raw_body', 'invalid_sig'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('requestRefund', () => {
    it('should process refund for a successful payment', async () => {
      const successPayment = {
        ...mockPayment,
        status: PaymentStatus.SUCCESS,
        gateway: PaymentGateway.RAZORPAY,
        gatewayPaymentId: 'pay_test',
      };

      paymentRepo.findOne.mockResolvedValue(successPayment);
      razorpayService.createRefund.mockResolvedValue({ refundId: 'rfnd_test', status: 'processed' });
      paymentRepo.save.mockResolvedValue({ ...successPayment, status: PaymentStatus.REFUNDED });

      const result = await service.requestRefund(1, 1, 'Customer request');

      expect(result.refundId).toBe('rfnd_test');
      expect(paymentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PaymentStatus.REFUNDED, refundId: 'rfnd_test' }),
      );
    });

    it('should throw when payment is not successful', async () => {
      paymentRepo.findOne.mockResolvedValue(mockPayment);

      await expect(service.requestRefund(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw when refund already initiated', async () => {
      const refundedPayment = { ...mockPayment, status: PaymentStatus.SUCCESS, refundId: 'existing_refund' };
      paymentRepo.findOne.mockResolvedValue(refundedPayment);

      await expect(service.requestRefund(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPayment', () => {
    it('should return payment for the user', async () => {
      paymentRepo.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPayment(1, 1);

      expect(result).toEqual(mockPayment);
    });

    it('should throw when payment not found', async () => {
      paymentRepo.findOne.mockResolvedValue(null);

      await expect(service.getPayment(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
