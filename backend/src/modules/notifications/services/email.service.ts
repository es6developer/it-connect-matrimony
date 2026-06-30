import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { ERROR_CODES } from '../../../common/constants';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, unknown>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    this.fromEmail = this.configService.get<string>('sendgrid.fromEmail');
    this.fromName = this.configService.get<string>('sendgrid.fromName');

    if (apiKey) {
      SendGrid.setApiKey(apiKey);
    } else {
      this.logger.warn('SendGrid API key not configured. Email sending disabled.');
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    if (!apiKey) {
      this.logger.warn('SendGrid not configured. Skipping email.');
      return false;
    }

    try {
      const msg: SendGrid.MailDataRequired = {
        to: options.to,
        from: {
          email: this.fromEmail || 'noreply@itconnectmatrimony.com',
          name: this.fromName || 'IT Connect Matrimony',
        },
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
          type: a.contentType,
          disposition: 'attachment' as const,
        })),
      };

      if (options.templateId) {
        msg.templateId = options.templateId;
        msg.dynamicTemplateData = options.dynamicTemplateData;
      }

      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      await SendGrid.send(msg);
      this.logger.log(`Email sent to ${recipients.join(', ')}: "${options.subject}"`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`, error.stack);

      if (error.response?.body) {
        this.logger.error(`SendGrid response: ${JSON.stringify(error.response.body)}`);
      }

      return false;
    }
  }

  async sendTemplate(
    templateId: string,
    to: string | string[],
    data: Record<string, unknown>,
  ): Promise<boolean> {
    const apiKey = this.configService.get<string>('sendgrid.apiKey');
    if (!apiKey) {
      this.logger.warn('SendGrid not configured. Skipping template email.');
      return false;
    }

    try {
      const msg: SendGrid.MailDataRequired = {
        to,
        from: {
          email: this.fromEmail || 'noreply@itconnectmatrimony.com',
          name: this.fromName || 'IT Connect Matrimony',
        },
        subject: '',
        templateId,
        dynamicTemplateData: data,
      };

      await SendGrid.send(msg);
      const recipients = Array.isArray(to) ? to.join(', ') : to;
      this.logger.log(`Template email sent to ${recipients} (template: ${templateId})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send template email to ${to}: ${error.message}`, error.stack);
      return false;
    }
  }
}
