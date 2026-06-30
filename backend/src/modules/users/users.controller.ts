import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(@CurrentUser('sub') uuid: string) {
    const user = await this.usersService.getProfile(uuid);
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateProfile(
    @CurrentUser('sub') uuid: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(uuid, dto);
    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  async deactivateAccount(@CurrentUser('sub') uuid: string) {
    await this.usersService.softDelete(uuid);
    return {
      success: true,
      message: 'Account deactivated successfully',
    };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get user by UUID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') uuid: string) {
    const user = await this.usersService.findById(uuid);
    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: ERROR_CODES.USER_NOT_FOUND,
        statusCode: 404,
      });
    }
    return {
      success: true,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('me/settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(
    @CurrentUser('sub') uuid: string,
    @Body() dto: Record<string, any>,
  ) {
    const result = await this.usersService.updateSettings(uuid, dto);
    return {
      success: true,
      message: 'Settings updated successfully',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @CurrentUser('sub') uuid: string,
    @Body() dto: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.changePassword(uuid, dto.currentPassword, dto.newPassword);
    return { success: true, message: 'Password changed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/stats')
  @ApiOperation({ summary: 'Get user dashboard stats' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(@CurrentUser('sub') uuid: string) {
    const stats = await this.usersService.getStats(uuid);
    return { success: true, message: 'Stats retrieved successfully', data: stats };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me/activity')
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiResponse({ status: 200, description: 'Activity log retrieved successfully' })
  async getActivity(
    @CurrentUser('sub') uuid: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getUserActivity(uuid, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Search users with filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async searchUsers(@Query() filters: UserFilterDto) {
    return this.usersService.searchUsers(filters);
  }
}
