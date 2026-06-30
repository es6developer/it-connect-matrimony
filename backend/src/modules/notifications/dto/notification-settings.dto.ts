import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable WhatsApp notifications' })
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Enable in-app notifications' })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Notify on new matches' })
  @IsOptional()
  @IsBoolean()
  matchNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on new messages' })
  @IsOptional()
  @IsBoolean()
  messageNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on interest received' })
  @IsOptional()
  @IsBoolean()
  interestNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on profile likes' })
  @IsOptional()
  @IsBoolean()
  likeNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on profile views' })
  @IsOptional()
  @IsBoolean()
  viewNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on subscription changes' })
  @IsOptional()
  @IsBoolean()
  subscriptionNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on promotional updates' })
  @IsOptional()
  @IsBoolean()
  promotionalNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Notify on reminders' })
  @IsOptional()
  @IsBoolean()
  reminderNotifications?: boolean;
}
