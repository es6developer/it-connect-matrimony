import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../../database/entities/notification.entity';
import { DeviceToken } from '../../database/entities/device-token.entity';
import { ERROR_CODES } from '../../common/constants';
import { NotificationChannel } from '../../common/enums';
import { PaginatedResult } from '../../common/interfaces';
import { PaginationDto } from '../../common/dto/pagination.dto';

interface CreateNotificationData {
  userId: number;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
  recipientEmail?: string;
  recipientPhone?: string;
  token?: string;
  tokens?: string[];
  templateId?: string;
  templateData?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
  ) {}

  async getUserNotifications(
    userId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Notification>> {
    const { skip, limit, sortBy, sortOrder } = pagination;

    const [data, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    const page = pagination.page ?? 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException({
        success: false,
        message: 'Notification not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { affected: result.affected ?? 0 };
  }

  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException({
        success: false,
        message: 'Notification not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    await this.notificationRepo.remove(notification);
  }

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = this.notificationRepo.create({
      uuid: uuidv4(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body ?? null,
      data: data.data ?? null,
      channel: data.channel ?? NotificationChannel.PUSH,
    });

    const saved = await this.notificationRepo.save(notification);
    this.logger.log(`Notification created: ${saved.uuid} for user ${data.userId}`);

    await this.dispatchToQueue(data);

    return saved;
  }

  async registerDeviceToken(
    userId: number,
    token: string,
    platform: 'ios' | 'android' | 'web',
    deviceName?: string,
    deviceId?: string,
  ): Promise<DeviceToken> {
    const existing = await this.deviceTokenRepo.findOne({
      where: { token },
    });

    if (existing) {
      existing.userId = userId;
      existing.platform = platform;
      existing.deviceName = deviceName ?? existing.deviceName;
      existing.deviceId = deviceId ?? existing.deviceId;
      existing.isActive = true;
      existing.lastUsedAt = new Date();
      return this.deviceTokenRepo.save(existing);
    }

    const deviceToken = this.deviceTokenRepo.create({
      userId,
      token,
      platform,
      deviceName: deviceName ?? null,
      deviceId: deviceId ?? null,
      lastUsedAt: new Date(),
    });

    return this.deviceTokenRepo.save(deviceToken);
  }

  async removeDeviceToken(tokenId: number, userId: number): Promise<void> {
    const deviceToken = await this.deviceTokenRepo.findOne({
      where: { id: tokenId, userId },
    });

    if (!deviceToken) {
      throw new NotFoundException({
        success: false,
        message: 'Device token not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    await this.deviceTokenRepo.remove(deviceToken);
  }

  async updateNotificationPreferences(
    userId: number,
    settings: Record<string, boolean>,
  ): Promise<void> {
    const userSettings = this.deviceTokenRepo.metadata.columns.reduce(
      (acc, col) => {
        if (settings[col.propertyName] !== undefined) {
          acc[col.propertyName] = settings[col.propertyName];
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    if (Object.keys(userSettings).length > 0) {
      await this.deviceTokenRepo.update({ userId }, userSettings);
    }

    this.logger.log(`Notification preferences updated for user ${userId}`);
  }

  private async dispatchToQueue(data: CreateNotificationData): Promise<void> {
    const jobData = {
      type: data.type,
      userId: data.userId,
      title: data.title,
      body: data.body ?? '',
      data: data.data ?? {},
      recipientEmail: data.recipientEmail,
      recipientPhone: data.recipientPhone,
      token: data.token,
      tokens: data.tokens,
      templateId: data.templateId,
      templateData: data.templateData,
    };

    const channel = data.channel ?? NotificationChannel.PUSH;

    if (channel === NotificationChannel.PUSH || channel === NotificationChannel.IN_APP) {
      this.logger.log(`[DEV] push notification: ${jobData.type}`);
    }

    if (channel === NotificationChannel.EMAIL && data.recipientEmail) {
      this.logger.log(`[DEV] email to ${data.recipientEmail}: ${jobData.type}`);
    }

    if (channel === NotificationChannel.SMS && data.recipientPhone) {
      this.logger.log(`[DEV] sms to ${data.recipientPhone}: ${jobData.type}`);
    }

    if (data.channel === undefined && data.recipientPhone) {
      this.logger.log(`[DEV] whatsapp to ${data.recipientPhone}: ${jobData.type}`);
    }

    await Promise.resolve();
  }
}
