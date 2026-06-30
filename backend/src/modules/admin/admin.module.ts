import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../../database/entities/admin-user.entity';
import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { Subscription } from '../../database/entities/subscription.entity';
import { Payment } from '../../database/entities/payment.entity';
import { Ticket } from '../../database/entities/ticket.entity';
import { TicketReply } from '../../database/entities/ticket-reply.entity';
import { Report } from '../../database/entities/report.entity';
import { VerificationRecord } from '../../database/entities/verification-record.entity';
import { Blog } from '../../database/entities/blog.entity';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { SiteSetting } from '../../database/entities/site-setting.entity';
import { Match } from '../../database/entities/match.entity';
import { Interest } from '../../database/entities/interest.entity';
import { Message } from '../../database/entities/message.entity';
import { UserActivity } from '../../database/entities/user-activity.entity';
import { UsersModule } from '../users/users.module';

import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UsersAdminController } from './users-admin.controller';
import { UsersAdminService } from './users-admin.service';
import { VerificationsController } from './verifications.controller';
import { ProfilesController } from './profiles.controller';
import { SubscriptionsAdminController } from './subscriptions-admin.controller';
import { PaymentsAdminController } from './payments-admin.controller';
import { ReportsController } from './reports.controller';
import { TicketsController } from './tickets.controller';
import { BlogsAdminController } from './blogs-admin.controller';
import { AnalyticsController } from './analytics.controller';
import { SettingsController } from './settings.controller';
import { AuditLogsController } from './audit-logs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUser,
      User,
      Profile,
      Subscription,
      Payment,
      Ticket,
      TicketReply,
      Report,
      VerificationRecord,
      Blog,
      AuditLog,
      ActivityLog,
      SiteSetting,
      Match,
      Interest,
      Message,
      UserActivity,
    ]),
    UsersModule,
  ],
  controllers: [
    DashboardController,
    UsersAdminController,
    VerificationsController,
    ProfilesController,
    SubscriptionsAdminController,
    PaymentsAdminController,
    ReportsController,
    TicketsController,
    BlogsAdminController,
    AnalyticsController,
    SettingsController,
    AuditLogsController,
  ],
  providers: [
    DashboardService,
    UsersAdminService,
  ],
  exports: [],
})
export class AdminModule {}
