import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGateway } from '../../../common/enums';

export class CreateOrderDto {
  @ApiProperty({ example: 1999, description: 'Amount in smallest currency unit (paise/cents)' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({ example: 'INR', default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ enum: PaymentGateway, example: PaymentGateway.RAZORPAY })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
