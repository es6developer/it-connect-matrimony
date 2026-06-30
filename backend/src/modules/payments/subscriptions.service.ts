import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Subscription } from '../../database/entities/subscription.entity';
import { Payment } from '../../database/entities/payment.entity';
import { SubscriptionStatus, PlanType, PaymentGateway } from '../../common/enums';

export interface PlanDetail {
  type: PlanType;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
}

const PLANS: PlanDetail[] = [
  {
    type: PlanType.FREE,
    name: 'Free',
    price: 0,
    currency: 'INR',
    durationDays: 0,
    features: [
      'Basic profile visibility',
      'Send up to 5 interests per day',
      'Basic search filters',
      'Upload up to 3 photos',
    ],
  },
  {
    type: PlanType.BASIC,
    name: 'Gold',
    price: 3999,
    currency: 'INR',
    durationDays: 30,
    features: [
      'Enhanced profile visibility',
      'Send up to 20 interests per day',
      'Advanced search filters',
      'Upload up to 10 photos',
      'See who viewed your profile',
      'Priority customer support',
    ],
  },
  {
    type: PlanType.PREMIUM,
    name: 'Premium',
    price: 1999,
    currency: 'INR',
    durationDays: 30,
    features: [
      'High profile visibility',
      'Unlimited interests',
      'All advanced search filters',
      'Upload up to 20 photos',
      'See who viewed your profile',
      'Direct messaging',
      'Priority customer support',
    ],
  },
  {
    type: PlanType.VIP,
    name: 'Platinum',
    price: 7999,
    currency: 'INR',
    durationDays: 30,
    features: [
      'Top profile visibility',
      'Unlimited interests & messaging',
      'All premium search filters',
      'Unlimited photo upload',
      'See who viewed & shortlisted',
      'Profile badge',
      'Dedicated relationship manager',
      '24/7 priority support',
    ],
  },
];

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  getPlans(): PlanDetail[] {
    return PLANS;
  }

  async getMySubscription(userId: number) {
    const sub = await this.subRepo.findOne({
      where: [
        { userId, status: SubscriptionStatus.ACTIVE },
        { userId, status: SubscriptionStatus.PENDING },
        { userId, status: SubscriptionStatus.TRIAL },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!sub) {
      return {
        planType: PlanType.FREE,
        status: SubscriptionStatus.ACTIVE,
        startDate: null,
        endDate: null,
        autoRenew: false,
        features: PLANS.find((p) => p.type === PlanType.FREE)?.features || [],
      };
    }

    const planDetails = PLANS.find((p) => p.type === sub.planType);
    return {
      ...sub,
      planName: planDetails?.name || sub.planType,
      features: planDetails?.features || [],
    };
  }

  async createSubscription(userId: number, planType: PlanType, paymentGateway: PaymentGateway, _couponCode?: string) {
    if (planType === PlanType.FREE)
      throw new BadRequestException('Free plan cannot be subscribed via payment');

    const activeSub = await this.subRepo.findOne({
      where: [
        { userId, status: SubscriptionStatus.ACTIVE },
        { userId, status: SubscriptionStatus.PENDING },
      ],
      order: { createdAt: 'DESC' },
    });
    if (activeSub && activeSub.status === SubscriptionStatus.ACTIVE)
      throw new BadRequestException('You already have an active subscription. Upgrade or cancel it first.');

    const plan = PLANS.find((p) => p.type === planType);
    if (!plan) throw new NotFoundException('Plan not found');

    const sub = this.subRepo.create({
      uuid: uuidv4(),
      userId,
      planType,
      status: SubscriptionStatus.PENDING,
      amount: plan.price,
      currency: plan.currency,
      paymentGateway,
      autoRenew: false,
      features: plan.features,
    });
    const savedSub = await this.subRepo.save(sub);

    return {
      subscriptionId: savedSub.id,
      uuid: savedSub.uuid,
      planType: savedSub.planType,
      amount: savedSub.amount,
      currency: savedSub.currency,
    };
  }

  async cancelSubscription(userId: number) {
    const sub = await this.subRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    if (!sub) throw new NotFoundException('No active subscription found');

    sub.status = SubscriptionStatus.CANCELLED;
    sub.autoRenew = false;
    await this.subRepo.save(sub);

    return { message: 'Subscription cancelled successfully', endDate: sub.endDate };
  }

  async upgradeSubscription(userId: number, newPlanType: PlanType) {
    if (newPlanType === PlanType.FREE)
      throw new BadRequestException('Cannot downgrade to free plan via upgrade');

    const activeSub = await this.subRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
    if (!activeSub) throw new NotFoundException('No active subscription to upgrade');

    const currentPlan = PLANS.find((p) => p.type === activeSub.planType);
    const newPlan = PLANS.find((p) => p.type === newPlanType);
    if (!currentPlan || !newPlan) throw new NotFoundException('Plan not found');

    if (currentPlan.price >= newPlan.price)
      throw new BadRequestException('New plan must have a higher price than current plan');

    const remainingDays = activeSub.endDate
      ? Math.max(0, Math.ceil((new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;
    const proratedCredit = (currentPlan.price / 30) * remainingDays;
    const proratedAmount = Math.max(0, newPlan.price - proratedCredit);

    return {
      currentPlan: currentPlan.name,
      newPlan: newPlan.name,
      remainingDays,
      proratedCredit: Math.round(proratedCredit * 100) / 100,
      proratedAmount: Math.round(proratedAmount * 100) / 100,
      amountDue: Math.round(proratedAmount * 100) / 100,
    };
  }

  async getHistory(userId: number, page = 1, limit = 20) {
    const [data, total] = await this.paymentRepo.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['subscription'],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }
}
