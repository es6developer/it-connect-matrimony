import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UsersAdminService } from './users-admin.service';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly usersAdminService: UsersAdminService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all users with filters' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async listUsers(@Query() query: AdminUsersQueryDto) {
    return this.usersAdminService.listUsers(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user details by UUID' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserDetail(@Param('id') uuid: string) {
    return this.usersAdminService.getUserDetail(uuid);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user status (activate/suspend/ban)' })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async updateUserStatus(
    @Param('id') uuid: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersAdminService.updateUserStatus(uuid, dto);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  async updateUserRole(
    @Param('id') uuid: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersAdminService.updateUserRole(uuid, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force delete user permanently' })
  @ApiResponse({ status: 200, description: 'User permanently deleted' })
  async forceDeleteUser(@Param('id') uuid: string) {
    return this.usersAdminService.forceDeleteUser(uuid);
  }

  @Post(':id/impersonate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate impersonation token for a user' })
  @ApiResponse({ status: 200, description: 'Impersonation token generated' })
  async impersonateUser(@Param('id') uuid: string) {
    return this.usersAdminService.impersonateUser(uuid);
  }
}
