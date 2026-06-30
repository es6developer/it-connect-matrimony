import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../../database/entities/coupon.entity';
import { CouponRedemption } from '../../database/entities/coupon-redemption.entity';
import { PlanType } from '../../common/enums';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponRedemption)
    private readonly redemptionRepo: Repository<CouponRedemption>,
  ) {}

  async validateCoupon(code: string, userId: number, planType: PlanType) {
    const coupon = await this.couponRepo.findOne({ where: { code: code.trim().toUpperCase(), isActive: true } });
    if (!coupon) throw new NotFoundException('Invalid or expired coupon code');

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil)
      throw new BadRequestException('Coupon has expired or is not yet valid');

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      throw new BadRequestException('Coupon usage limit has been exhausted');

    if (coupon.applicablePlans) {
      const plans = coupon.applicablePlans as string[];
      if (plans.length > 0 && !plans.includes(planType))
        throw new BadRequestException('Coupon is not applicable for the selected plan');
    }

    const existingRedemption = await this.redemptionRepo.findOne({
      where: { couponId: coupon.id, userId },
    });
    if (existingRedemption)
      throw new BadRequestException('You have already used this coupon');

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
    };
  }

  async applyCoupon(couponId: number, _userId: number, amount: number, _planType: PlanType) {
    const coupon = await this.couponRepo.findOne({ where: { id: couponId, isActive: true } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (coupon.minOrderAmount !== null && amount < coupon.minOrderAmount)
      throw new BadRequestException(`Minimum order amount of ${coupon.minOrderAmount} required`);

    let discount = coupon.type === 'percentage'
      ? (amount * coupon.value) / 100
      : coupon.value;

    if (coupon.maxDiscount !== null)
      discount = Math.min(discount, coupon.maxDiscount);

    discount = Math.min(discount, amount);

    return {
      couponId: coupon.id,
      code: coupon.code,
      originalAmount: amount,
      discountAmount: Math.round(discount * 100) / 100,
      finalAmount: Math.round((amount - discount) * 100) / 100,
    };
  }

  async markRedeemed(couponId: number, userId: number, subscriptionId: number, paymentId: number, discountAmount: number) {
    await this.couponRepo.increment({ id: couponId }, 'usedCount', 1);
    const redemption = this.redemptionRepo.create({
      couponId,
      userId,
      subscriptionId,
      paymentId,
      discountAmount,
    });
    return this.redemptionRepo.save(redemption);
  }

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.couponRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdByUser'],
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

  async findOne(id: number) {
    const coupon = await this.couponRepo.findOne({ where: { id }, relations: ['createdByUser'] });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(data: Partial<Coupon>, adminUserId: number) {
    if (!data.code) throw new BadRequestException('Coupon code is required');
    const existing = await this.couponRepo.findOne({ where: { code: data.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException('Coupon code already exists');

    const coupon = this.couponRepo.create({
      ...data,
      code: data.code!.trim().toUpperCase(),
      createdBy: adminUserId,
    });
    return this.couponRepo.save(coupon);
  }

  async update(id: number, data: Partial<Coupon>) {
    const coupon = await this.findOne(id);
    if (data.code) {
      data.code = data.code.trim().toUpperCase();
      const duplicate = await this.couponRepo.findOne({ where: { code: data.code } });
      if (duplicate && duplicate.id !== id)
        throw new BadRequestException('Coupon code already exists');
    }
    Object.assign(coupon, data);
    return this.couponRepo.save(coupon);
  }

  async remove(id: number) {
    const coupon = await this.findOne(id);
    await this.couponRepo.remove(coupon);
  }
}
