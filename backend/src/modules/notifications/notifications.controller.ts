import {
  Controller,
  Get,
  Patch,
  Delete,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications (paginated)' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getMyNotifications(
    @CurrentUser('id') userId: number,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.notificationsService.getUserNotifications(
      userId,
      pagination,
    );
    return {
      success: true,
      message: 'Notifications retrieved successfully',
      ...result,
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser('id') userId: number) {
    const result = await this.notificationsService.getUnreadCount(userId);
    return {
      success: true,
      message: 'Unread count retrieved successfully',
      data: result,
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const notification = await this.notificationsService.markAsRead(id, userId);
    return {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('id') userId: number) {
    const result = await this.notificationsService.markAllAsRead(userId);
    return {
      success: true,
      message: 'All notifications marked as read',
      data: result,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    await this.notificationsService.deleteNotification(id, userId);
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  async updateSettings(
    @CurrentUser('id') userId: number,
    @Body() dto: NotificationSettingsDto,
  ) {
    await this.notificationsService.updateNotificationPreferences(
      userId,
      dto as unknown as Record<string, boolean>,
    );
    return {
      success: true,
      message: 'Notification preferences updated successfully',
    };
  }

  @Post('device-token')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register device token for push notifications' })
  @ApiResponse({ status: 201, description: 'Device token registered successfully' })
  async registerDeviceToken(
    @CurrentUser('id') userId: number,
    @Body() dto: RegisterDeviceDto,
  ) {
    const deviceToken = await this.notificationsService.registerDeviceToken(
      userId,
      dto.token,
      dto.platform,
      dto.deviceName,
      dto.deviceId,
    );
    return {
      success: true,
      message: 'Device token registered successfully',
      data: deviceToken,
    };
  }

  @Delete('device-token/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove device token' })
  @ApiParam({ name: 'id', description: 'Device token ID' })
  @ApiResponse({ status: 200, description: 'Device token removed successfully' })
  @ApiResponse({ status: 404, description: 'Device token not found' })
  async removeDeviceToken(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    await this.notificationsService.removeDeviceToken(id, userId);
    return {
      success: true,
      message: 'Device token removed successfully',
    };
  }
}
