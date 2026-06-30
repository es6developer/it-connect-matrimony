import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentGateway } from '../../../common/enums';

export class VerifyPaymentDto {
  @ApiProperty({ enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentIntentId?: string;
}
