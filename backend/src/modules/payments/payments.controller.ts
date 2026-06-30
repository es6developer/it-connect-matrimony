import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { RefundDto } from './dto/refund.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PaymentGateway } from '../../common/enums';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('create-order')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payment order' })
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.paymentsService.createOrder(dto.amount, dto.currency || 'INR', userId, dto.description);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment after completion' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto.gateway, dto.paymentId, dto.orderId, dto.signature);
  }

  @Public()
  @Post('webhook/:gateway')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook handler for payment gateways' })
  async handleWebhook(
    @Param('gateway') gateway: string,
    @Req() req: Request,
    @Headers('x-razorpay-signature') razorpaySignature?: string,
    @Headers('stripe-signature') stripeSignature?: string,
  ) {
    const signature = gateway === PaymentGateway.RAZORPAY ? razorpaySignature : stripeSignature;
    return this.paymentsService.handleWebhook(
      gateway as PaymentGateway,
      req.body,
      req.body ? JSON.stringify(req.body) : '',
      signature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  async getPayment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.paymentsService.getPayment(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a refund for a payment' })
  async requestRefund(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RefundDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.paymentsService.requestRefund(id, userId, dto.reason);
  }
}
