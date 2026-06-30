import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { User } from '../../database/entities/user.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { VerificationRecord } from '../../database/entities/verification-record.entity';
import { Report } from '../../database/entities/report.entity';
import { Ticket } from '../../database/entities/ticket.entity';
import { UserRole, UserStatus, SubscriptionStatus, PaymentStatus } from '../../common/enums';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(VerificationRecord)
    private readonly verificationRepository: Repository<VerificationRecord>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getDashboard() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekAgo = subDays(now, 7);
    const monthAgo = subDays(now, 30);

    const [
      totalUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsers,
      premiumUsers,
      revenueToday,
      revenueThisWeek,
      revenueThisMonth,
      totalRevenue,
      pendingVerifications,
      pendingReports,
      openTickets,
      recentRegistrations,
      revenueChartData,
    ] = await Promise.all([
      this.userRepository.count({ withDeleted: false }),
      this.userRepository.count({
        where: { createdAt: Between(todayStart, todayEnd) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(weekAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(monthAgo, now) },
      }),
      this.userRepository.count({
        where: {
          status: UserStatus.ACTIVE,
          lastActiveAt: Between(weekAgo, now),
        },
      }),
      this.subscriptionRepository.count({
        where: { status: SubscriptionStatus.ACTIVE },
      }),
      this.getRevenueBetween(todayStart, todayEnd),
      this.getRevenueBetween(weekAgo, now),
      this.getRevenueBetween(monthAgo, now),
      this.getTotalRevenue(),
      this.verificationRepository.count({ where: { status: 'pending' } }),
      this.reportRepository.count({ where: { status: 'pending' } }),
      this.ticketRepository.count({ where: { status: 'open' as any } }),
      this.userRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
        relations: ['profile'],
      }),
      this.getRevenueChartData(30),
    ]);

    return {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          active: activeUsers,
          premium: premiumUsers,
        },
        revenue: {
          today: revenueToday,
          thisWeek: revenueThisWeek,
          thisMonth: revenueThisMonth,
          total: totalRevenue,
        },
        pendingItems: {
          verifications: pendingVerifications,
          reports: pendingReports,
          openTickets: openTickets,
        },
        recentRegistrations: recentRegistrations.map((u) => ({
          uuid: u.uuid,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          gender: u.gender,
          role: u.role,
          status: u.status,
          profile: u.profile
            ? {
                city: u.profile.city,
                country: u.profile.country,
              }
            : null,
          createdAt: u.createdAt,
        })),
        revenueChart: revenueChartData,
      },
    };
  }

  private async getRevenueBetween(start: Date, end: Date): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  private async getRevenueChartData(days: number): Promise<{ date: string; revenue: number }[]> {
    const chartData: { date: string; revenue: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const start = startOfDay(day);
      const end = endOfDay(day);

      const revenue = await this.getRevenueBetween(start, end);

      chartData.push({
        date: day.toISOString().split('T')[0],
        revenue,
      });
    }

    return chartData;
  }
}
