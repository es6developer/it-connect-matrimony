import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Admin - Audit Logs')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/audit-logs')
export class AuditLogsController {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async listAuditLogs(@Query() query: AuditLogQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', action, resourceType, adminId, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin')
      .leftJoinAndSelect('admin.user', 'user');

    if (action) qb.andWhere('log.action = :action', { action });
    if (resourceType) qb.andWhere('log.resourceType = :resourceType', { resourceType });
    if (dateFrom) qb.andWhere('log.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('log.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    if (adminId) {
      qb.andWhere('admin.uuid = :adminId', { adminId });
    }

    const allowedSortFields = ['createdAt', 'action', 'resourceType'];
    const orderField = allowedSortFields.includes(sortBy) ? `log.${sortBy}` : 'log.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Audit logs retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get audit log details' })
  @ApiResponse({ status: 200, description: 'Audit log details retrieved' })
  async getAuditLog(@Param('id') id: string) {
    const log = await this.auditLogRepository.findOne({
      where: { uuid: id },
      relations: ['admin', 'admin.user'],
    });

    if (!log) {
      throw new NotFoundException({
        success: false,
        message: 'Audit log not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Audit log details retrieved successfully',
      data: log,
    };
  }
}
