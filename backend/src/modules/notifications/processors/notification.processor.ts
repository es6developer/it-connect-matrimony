import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PushNotificationService } from '../services/push-notification.service';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { WhatsAppService } from '../services/whatsapp.service';

interface NotificationJobData {
  type: string;
  userId: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  recipientEmail?: string;
  recipientPhone?: string;
  token?: string;
  tokens?: string[];
  templateId?: string;
  templateData?: Record<string, unknown>;
}

@Processor('push')
export class PushProcessor extends WorkerHost {
  private readonly logger = new Logger(PushProcessor.name);

  constructor(
    private readonly pushService: PushNotificationService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    this.logger.log(`Processing push job ${job.id}: ${job.data.title}`);

    const { token, tokens, userId, title, body, data } = job.data;

    if (tokens && tokens.length > 0) {
      return this.pushService.sendToMultiple(
        tokens,
        { title, body },
        data as Record<string, string>,
      );
    }

    if (token) {
      return this.pushService.sendPush(
        token,
        { title, body },
        data as Record<string, string>,
      );
    }

    if (userId) {
      return this.pushService.sendToUser(
        userId,
        { title, body },
        data as Record<string, string>,
      );
    }

    this.logger.warn(`Push job ${job.id} has no recipient`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Push job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Push job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }
}

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    this.logger.log(`Processing email job ${job.id}: ${job.data.title}`);

    const { recipientEmail, body, templateId, templateData, data } = job.data;

    if (!recipientEmail) {
      this.logger.warn(`Email job ${job.id} has no recipient email`);
      return;
    }

    if (templateId) {
      return this.emailService.sendTemplate(templateId, recipientEmail, templateData ?? {});
    }

    return this.emailService.sendEmail({
      to: recipientEmail,
      subject: data?.subject as string ?? job.data.title,
      html: body,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Email job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }
}

@Processor('sms')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(
    private readonly smsService: SmsService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    this.logger.log(`Processing SMS job ${job.id}`);

    const { recipientPhone, body, data } = job.data;

    if (!recipientPhone) {
      this.logger.warn(`SMS job ${job.id} has no recipient phone`);
      return;
    }

    const isOtp = data?.isOtp === true;
    if (isOtp) {
      return this.smsService.sendOtp(recipientPhone, body);
    }

    return this.smsService.sendSms(recipientPhone, body);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`SMS job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`SMS job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }
}

@Processor('whatsapp')
export class WhatsAppProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsAppProcessor.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    this.logger.log(`Processing WhatsApp job ${job.id}`);

    const { recipientPhone, body, data } = job.data;

    if (!recipientPhone) {
      this.logger.warn(`WhatsApp job ${job.id} has no recipient phone`);
      return;
    }

    const mediaUrl = data?.mediaUrl as string | undefined;
    return this.whatsappService.sendWhatsApp(recipientPhone, body, mediaUrl);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`WhatsApp job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`WhatsApp job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`);
  }
}
