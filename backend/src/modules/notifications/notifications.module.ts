import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './services/push-notification.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { WhatsAppService } from './services/whatsapp.service';
import { Notification } from '../../database/entities/notification.entity';
import { NotificationTemplate } from '../../database/entities/notification-template.entity';
import { DeviceToken } from '../../database/entities/device-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationTemplate, DeviceToken]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    PushNotificationService,
    EmailService,
    SmsService,
    WhatsAppService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
