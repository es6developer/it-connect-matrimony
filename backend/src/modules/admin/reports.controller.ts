import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
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
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { AdminReportsQueryDto } from './dto/admin-reports-query.dto';
import { UpdateReportStatusDto, TakeReportActionDto } from './dto/report-action.dto';
import { UserStatus } from '../../common/enums';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Admin - Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/reports')
export class ReportsController {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved' })
  async listReports(@Query() query: AdminReportsQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', status, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reportedUser', 'reportedUser')
      .leftJoinAndSelect('report.assignedToUser', 'assignedToUser');

    if (status) qb.andWhere('report.status = :status', { status });
    if (dateFrom) qb.andWhere('report.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('report.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    const allowedSortFields = ['createdAt', 'updatedAt', 'status', 'reason'];
    const orderField = allowedSortFields.includes(sortBy) ? `report.${sortBy}` : 'report.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Reports retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get report details' })
  @ApiResponse({ status: 200, description: 'Report details retrieved' })
  async getReport(@Param('id') id: string) {
    const report = await this.reportRepository.findOne({
      where: { uuid: id },
      relations: ['reporter', 'reportedUser', 'assignedToUser'],
    });

    if (!report) {
      throw new NotFoundException({
        success: false,
        message: 'Report not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Report details retrieved successfully',
      data: report,
    };
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update report status' })
  @ApiResponse({ status: 200, description: 'Report status updated' })
  async updateReportStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto) {
    const report = await this.reportRepository.findOne({ where: { uuid: id } });

    if (!report) {
      throw new NotFoundException({
        success: false,
        message: 'Report not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    report.status = dto.status;
    if (dto.notes) report.resolutionNotes = dto.notes;
    if (dto.status === 'resolved' || dto.status === 'dismissed') {
      report.resolvedAt = new Date();
    }

    await this.reportRepository.save(report);

    return {
      success: true,
      message: `Report status updated to ${dto.status}`,
    };
  }

  @Post(':id/action')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Take action on reported user' })
  @ApiResponse({ status: 200, description: 'Action taken successfully' })
  async takeAction(@Param('id') id: string, @Body() dto: TakeReportActionDto) {
    const report = await this.reportRepository.findOne({
      where: { uuid: id },
      relations: ['reportedUser'],
    });

    if (!report) {
      throw new NotFoundException({
        success: false,
        message: 'Report not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    switch (dto.action) {
      case 'warn':
        break;
      case 'suspend':
        if (report.reportedUser) {
          report.reportedUser.status = UserStatus.SUSPENDED;
          await this.userRepository.save(report.reportedUser);
        }
        break;
      case 'ban':
        if (report.reportedUser) {
          report.reportedUser.status = UserStatus.BLOCKED;
          await this.userRepository.save(report.reportedUser);
        }
        break;
      case 'dismiss':
        break;
      default:
        break;
    }

    report.status = 'resolved';
    report.resolutionNotes = dto.reason;
    report.resolvedAt = new Date();
    await this.reportRepository.save(report);

    return {
      success: true,
      message: `Action '${dto.action}' taken on reported user`,
    };
  }
}
