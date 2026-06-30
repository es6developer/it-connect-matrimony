import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: Twilio.Twilio | null;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.fromNumber = this.configService.get<string>('twilio.phoneNumber', '');

    if (accountSid && authToken) {
      this.client = Twilio(accountSid, authToken);
    } else {
      this.client = null;
      this.logger.warn('Twilio credentials not configured. SMS sending disabled.');
    }
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Twilio not configured. Skipping SMS.');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        from: this.fromNumber,
        to: phone,
        body: message,
      });

      this.logger.log(`SMS sent to ${phone}: sid=${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendOtp(phone: string, otp: string): Promise<boolean> {
    const message = `Your IT Connect Matrimony verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`;
    return this.sendSms(phone, message);
  }
}
