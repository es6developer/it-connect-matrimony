import {
  Controller,
  Get,
  Patch,
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
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Subscription } from '../../database/entities/subscription.entity';
import { User } from '../../database/entities/user.entity';
import { SubscriptionsQueryDto, CreateSubscriptionDto } from './dto/subscription.dto';
import { SubscriptionStatus, PlanType } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Admin - Subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/subscriptions')
export class SubscriptionsAdminController {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved' })
  async listSubscriptions(@Query() query: SubscriptionsQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', planType, status, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.subscriptionRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.user', 'user');

    if (planType) qb.andWhere('sub.planType = :planType', { planType });
    if (status) qb.andWhere('sub.status = :status', { status });
    if (dateFrom) qb.andWhere('sub.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('sub.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    const allowedSortFields = ['createdAt', 'updatedAt', 'planType', 'status', 'startDate', 'endDate', 'amount'];
    const orderField = allowedSortFields.includes(sortBy) ? `sub.${sortBy}` : 'sub.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Subscriptions retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active subscriptions count' })
  @ApiResponse({ status: 200, description: 'Active subscriptions count' })
  async getActiveCount() {
    const count = await this.subscriptionRepository.count({
      where: { status: SubscriptionStatus.ACTIVE },
    });

    return {
      success: true,
      message: 'Active subscriptions count retrieved',
      data: { activeSubscriptions: count },
    };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force cancel a subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async forceCancel(@Param('id') id: string) {
    const subscription = await this.subscriptionRepository.findOne({ where: { uuid: id } });

    if (!subscription) {
      throw new NotFoundException({
        success: false,
        message: 'Subscription not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    await this.subscriptionRepository.save(subscription);

    return {
      success: true,
      message: 'Subscription cancelled successfully',
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Manually create a subscription for a user' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async createSubscription(@Body() dto: CreateSubscriptionDto) {
    const user = await this.userRepository.findOne({ where: { uuid: dto.userId } });

    if (!user) {
      throw new BadRequestException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 400,
      });
    }

    const subscription = this.subscriptionRepository.create({
      uuid: uuidv4(),
      userId: user.id,
      planType: dto.planType,
      status: SubscriptionStatus.ACTIVE,
      amount: dto.amount,
      currency: dto.currency || 'INR',
      startDate: dto.startDate || new Date().toISOString().split('T')[0],
      endDate: dto.endDate || null,
    });

    await this.subscriptionRepository.save(subscription);

    return {
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    };
  }
}
