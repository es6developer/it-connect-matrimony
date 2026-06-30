import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Twilio from 'twilio';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly client: Twilio.Twilio | null;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    const phoneNumber = this.configService.get<string>('twilio.phoneNumber', '');

    if (accountSid && authToken) {
      this.client = Twilio(accountSid, authToken);
      this.fromNumber = `whatsapp:${phoneNumber}`;
    } else {
      this.client = null;
      this.fromNumber = '';
      this.logger.warn('Twilio credentials not configured. WhatsApp sending disabled.');
    }
  }

  async sendWhatsApp(
    phone: string,
    message: string,
    mediaUrl?: string,
  ): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Twilio not configured. Skipping WhatsApp message.');
      return false;
    }

    try {
      const to = `whatsapp:${phone}`;

      const messagePayload: any = {
        from: this.fromNumber,
        to,
        body: message,
      };

      if (mediaUrl) {
        messagePayload.mediaUrl = [mediaUrl];
      }

      const result = await this.client.messages.create(messagePayload);
      this.logger.log(`WhatsApp sent to ${phone}: sid=${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${phone}: ${error.message}`, error.stack);
      return false;
    }
  }
}
