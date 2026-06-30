import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { User } from '../../database/entities/user.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Match } from '../../database/entities/match.entity';
import { Interest } from '../../database/entities/interest.entity';
import { Message } from '../../database/entities/message.entity';
import { UserActivity } from '../../database/entities/user-activity.entity';
import { UserStatus, PaymentStatus, MatchStatus, InterestStatus } from '../../common/enums';

@ApiTags('Admin - Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
  ) {}

  @Get('users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user analytics (registrations, active, churn)' })
  @ApiResponse({ status: 200, description: 'User analytics retrieved' })
  async getUserAnalytics() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);
    const threeMonthsAgo = subDays(now, 90);

    const [
      totalUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      newThisQuarter,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      churnedThisMonth,
    ] = await Promise.all([
      this.userRepository.count({ withDeleted: false }),
      this.userRepository.count({ where: { createdAt: Between(todayStart, now) } }),
      this.userRepository.count({ where: { createdAt: Between(weekAgo, now) } }),
      this.userRepository.count({ where: { createdAt: Between(monthAgo, now) } }),
      this.userRepository.count({ where: { createdAt: Between(threeMonthsAgo, now) } }),
      this.userRepository.count({ where: { lastActiveAt: Between(todayStart, now) } }),
      this.userRepository.count({ where: { lastActiveAt: Between(weekAgo, now) } }),
      this.userRepository.count({ where: { lastActiveAt: Between(monthAgo, now) } }),
      this.userRepository.count({ where: { lastActiveAt: LessThanOrEqual(threeMonthsAgo), status: UserStatus.INACTIVE } }),
    ]);

    const statusBreakdown = await this.userRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.status')
      .getRawMany();

    return {
      success: true,
      message: 'User analytics retrieved successfully',
      data: {
        total: totalUsers,
        registrations: {
          today: newToday,
          thisWeek: newThisWeek,
          thisMonth: newThisMonth,
          thisQuarter: newThisQuarter,
        },
        active: {
          today: activeToday,
          thisWeek: activeThisWeek,
          thisMonth: activeThisMonth,
        },
        churnedThisMonth,
        statusBreakdown: statusBreakdown.map((r) => ({
          status: r.status,
          count: parseInt(r.count, 10),
        })),
      },
    };
  }

  @Get('revenue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved' })
  async getRevenueAnalytics() {
    const now = new Date();
    const monthAgo = subDays(now, 30);

    const [totalRevenue, monthlyRevenue, monthlyTransactions, averageOrderValue] = await Promise.all([
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .getRawOne(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'total')
        .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('payment.createdAt >= :dateFrom', { dateFrom: monthAgo })
        .getRawOne(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('COUNT(payment.id)', 'count')
        .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('payment.createdAt >= :dateFrom', { dateFrom: monthAgo })
        .getRawOne(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('COALESCE(AVG(payment.amount), 0)', 'avg')
        .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
        .getRawOne(),
    ]);

    const gatewayBreakdown = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.gateway', 'gateway')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .groupBy('payment.gateway')
      .getRawMany();

    const monthly = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE_FORMAT(payment.createdAt, '%Y-%m')", 'month')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'revenue')
      .addSelect('COUNT(payment.id)', 'transactions')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .limit(12)
      .getRawMany();

    return {
      success: true,
      message: 'Revenue analytics retrieved successfully',
      data: {
        totalRevenue: parseFloat(totalRevenue?.total || '0'),
        monthlyRevenue: parseFloat(monthlyRevenue?.total || '0'),
        monthlyTransactions: parseInt(monthlyTransactions?.count || '0', 10),
        averageOrderValue: parseFloat(averageOrderValue?.avg || '0'),
        gatewayBreakdown: gatewayBreakdown.map((r) => ({
          gateway: r.gateway,
          count: parseInt(r.count, 10),
          total: parseFloat(r.total),
        })),
        monthlyTrend: monthly.map((r) => ({
          month: r.month,
          revenue: parseFloat(r.revenue),
          transactions: parseInt(r.transactions, 10),
        })),
      },
    };
  }

  @Get('matches')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get match statistics' })
  @ApiResponse({ status: 200, description: 'Match statistics retrieved' })
  async getMatchAnalytics() {
    const now = new Date();
    const monthAgo = subDays(now, 30);

    const [totalMatches, monthlyMatches, totalInterests, acceptedInterests, declinedInterests] = await Promise.all([
      this.matchRepository.count(),
      this.matchRepository.count({ where: { createdAt: Between(monthAgo, now) } }),
      this.interestRepository.count(),
      this.interestRepository.count({ where: { status: InterestStatus.ACCEPTED } }),
      this.interestRepository.count({ where: { status: InterestStatus.DECLINED } }),
    ]);

    return {
      success: true,
      message: 'Match analytics retrieved successfully',
      data: {
        totalMatches,
        monthlyMatches,
        interests: {
          total: totalInterests,
          accepted: acceptedInterests,
          declined: declinedInterests,
          acceptanceRate: totalInterests > 0 ? ((acceptedInterests / totalInterests) * 100).toFixed(2) : '0',
        },
      },
    };
  }

  @Get('engagement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user engagement metrics' })
  @ApiResponse({ status: 200, description: 'Engagement metrics retrieved' })
  async getEngagementAnalytics() {
    const now = new Date();
    const weekAgo = subDays(now, 7);

    const [totalMessages, messagesThisWeek, totalProfileViews, viewsThisWeek, totalSearches] = await Promise.all([
      this.messageRepository.count(),
      this.messageRepository.count({ where: { createdAt: Between(weekAgo, now) } }),
      this.userActivityRepository.count({ where: { action: 'profile_view' } }),
      this.userActivityRepository.count({ where: { action: 'profile_view', createdAt: Between(weekAgo, now) } }),
      this.userActivityRepository.count({ where: { action: 'search' } }),
    ]);

    return {
      success: true,
      message: 'Engagement analytics retrieved successfully',
      data: {
        messages: {
          total: totalMessages,
          thisWeek: messagesThisWeek,
        },
        profileViews: {
          total: totalProfileViews,
          thisWeek: viewsThisWeek,
        },
        searches: {
          total: totalSearches,
        },
      },
    };
  }
}
