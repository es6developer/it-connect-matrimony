import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType, PaymentGateway } from '../../../common/enums';

export class CreateSubscriptionDto {
  @ApiProperty({ enum: PlanType, example: PlanType.PREMIUM })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.RAZORPAY })
  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  couponCode?: string;
}
