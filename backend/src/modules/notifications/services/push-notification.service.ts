import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as firebase from 'firebase-admin';
import { DeviceToken } from '../../../database/entities/device-token.entity';
import { ERROR_CODES } from '../../../common/constants';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly firebaseApp: firebase.app.App;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepo: Repository<DeviceToken>,
  ) {
    const projectId = this.configService.get<string>('firebase.projectId');
    const privateKey = this.configService.get<string>('firebase.privateKey');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');

    if (projectId && privateKey && clientEmail) {
      this.firebaseApp = firebase.initializeApp({
        credential: firebase.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });
    } else {
      this.logger.warn('Firebase credentials not configured. Push notifications disabled.');
    }
  }

  async sendPush(
    token: string,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Skipping push notification.');
      return false;
    }

    try {
      const message: firebase.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data ?? {},
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      };

      const response = await this.firebaseApp.messaging().send(message);
      this.logger.log(`Push sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push to token ${token.substring(0, 20)}...: ${error.message}`, error.stack);

      if (this.isInvalidTokenError(error)) {
        await this.deactivateToken(token);
      }

      return false;
    }
  }

  async sendToUser(
    userId: number,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<{ success: number; failed: number }> {
    const tokens = await this.deviceTokenRepo.find({
      where: { userId, isActive: true },
    });

    if (!tokens.length) {
      this.logger.warn(`No active device tokens found for user ${userId}`);
      return { success: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
      tokens.map((t) => this.sendPush(t.token, notification, data)),
    );

    const success = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter((r) => r.status === 'rejected' || !r.value).length;

    this.logger.log(`Push to user ${userId}: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }

  async sendToMultiple(
    tokens: string[],
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<{ success: number; failed: number }> {
    if (!tokens.length) return { success: 0, failed: 0 };

    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Skipping batch push.');
      return { success: 0, failed: tokens.length };
    }

    try {
      const message: firebase.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data ?? {},
        android: { priority: 'high' },
        apns: {
          payload: {
            aps: { sound: 'default', badge: 1, contentAvailable: true },
          },
        },
      };

      const response = await this.firebaseApp.messaging().sendEachForMulticast(message);
      this.logger.log(`Batch push: ${response.successCount} succeeded, ${response.failureCount} failed`);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && this.isInvalidTokenError(resp.error)) {
            this.deactivateToken(tokens[idx]);
          }
        });
      }

      return { success: response.successCount, failed: response.failureCount };
    } catch (error) {
      this.logger.error(`Batch push failed: ${error.message}`, error.stack);
      return { success: 0, failed: tokens.length };
    }
  }

  private isInvalidTokenError(error: any): boolean {
    const code = error?.code || error?.errorInfo?.code;
    return code === 'messaging/invalid-registration-token'
      || code === 'messaging/registration-token-not-registered'
      || code === 'messaging/invalid-argument';
  }

  private async deactivateToken(token: string): Promise<void> {
    try {
      await this.deviceTokenRepo.update({ token }, { isActive: false });
      this.logger.log(`Deactivated invalid device token`);
    } catch (err) {
      this.logger.error(`Failed to deactivate token: ${err.message}`);
    }
  }
}
