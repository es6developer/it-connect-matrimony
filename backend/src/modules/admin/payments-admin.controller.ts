import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Payment } from '../../database/entities/payment.entity';
import { PaymentsQueryDto, RevenueQueryDto } from './dto/payment-query.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentStatus } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Admin - Payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/payments')
export class PaymentsAdminController {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved' })
  async listPayments(@Query() query: PaymentsQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', status, gateway, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.subscription', 'subscription');

    if (status) qb.andWhere('payment.status = :status', { status });
    if (gateway) qb.andWhere('payment.gateway = :gateway', { gateway });
    if (dateFrom) qb.andWhere('payment.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('payment.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    const allowedSortFields = ['createdAt', 'updatedAt', 'amount', 'status', 'gateway'];
    const orderField = allowedSortFields.includes(sortBy) ? `payment.${sortBy}` : 'payment.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Payments retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get('revenue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get revenue reports' })
  @ApiResponse({ status: 200, description: 'Revenue report retrieved' })
  async getRevenueReport(@Query() query: RevenueQueryDto) {
    const { dateFrom, dateTo, groupBy = 'day' } = query;

    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'revenue')
      .addSelect('COUNT(payment.id)', 'transactions')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS });

    if (dateFrom) qb.andWhere('payment.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('payment.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    let dateFormat: string;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-%u';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    qb.addSelect(`DATE_FORMAT(payment.createdAt, '${dateFormat}')`, 'period');
    qb.groupBy('period');
    qb.orderBy('period', 'ASC');

    const data = await qb.getRawMany();
    const totals = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
      .addSelect('COUNT(payment.id)', 'totalTransactions')
      .addSelect('COALESCE(SUM(payment.refundAmount), 0)', 'totalRefunds')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne();

    return {
      success: true,
      message: 'Revenue report retrieved successfully',
      data: {
        summary: {
          totalRevenue: parseFloat(totals?.totalRevenue || '0'),
          totalTransactions: parseInt(totals?.totalTransactions || '0', 10),
          totalRefunds: parseFloat(totals?.totalRefunds || '0'),
        },
        breakdown: data.map((row) => ({
          period: row.period,
          revenue: parseFloat(row.revenue),
          transactions: parseInt(row.transactions, 10),
        })),
      },
    };
  }

  @Post(':id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  async refundPayment(@Param('id') id: string, @Body() dto: RefundPaymentDto) {
    const payment = await this.paymentRepository.findOne({ where: { uuid: id } });

    if (!payment) {
      throw new NotFoundException({
        success: false,
        message: 'Payment not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException({
        success: false,
        message: 'Payment has already been refunded',
        error: ERROR_CODES.INVALID_INPUT,
        statusCode: 400,
      });
    }

    const refundAmount = dto.amount || payment.amount;
    const isFullRefund = refundAmount >= payment.amount;

    payment.refundId = `refund_${Date.now()}`;
    payment.refundAmount = refundAmount;
    payment.refundReason = dto.reason;
    payment.refundedAt = new Date();
    payment.status = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    await this.paymentRepository.save(payment);

    return {
      success: true,
      message: `Payment ${isFullRefund ? 'fully' : 'partially'} refunded successfully`,
      data: {
        refundAmount,
        refundReason: dto.reason,
        status: payment.status,
      },
    };
  }
}
