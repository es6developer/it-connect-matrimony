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
import { VerificationRecord } from '../../database/entities/verification-record.entity';
import { User } from '../../database/entities/user.entity';
import { VerificationsQueryDto } from './dto/verifications-query.dto';
import { RejectVerificationDto, ApproveVerificationDto } from './dto/verification-action.dto';
import { ERROR_CODES } from '../../common/constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces';

@ApiTags('Admin - Verifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/verifications')
export class VerificationsController {
  constructor(
    @InjectRepository(VerificationRecord)
    private readonly verificationRepository: Repository<VerificationRecord>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all verification requests' })
  @ApiResponse({ status: 200, description: 'Verifications retrieved successfully' })
  async listVerifications(@Query() query: VerificationsQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', type, status, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const qb = this.verificationRepository
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.user', 'user')
      .leftJoinAndSelect('v.verifiedByUser', 'verifiedByUser');

    if (type) qb.andWhere('v.type = :type', { type });
    if (status) qb.andWhere('v.status = :status', { status });
    if (dateFrom) qb.andWhere('v.createdAt >= :dateFrom', { dateFrom: new Date(dateFrom) });
    if (dateTo) qb.andWhere('v.createdAt <= :dateTo', { dateTo: new Date(dateTo) });

    const allowedSortFields = ['createdAt', 'updatedAt', 'type', 'status'];
    const orderField = allowedSortFields.includes(sortBy) ? `v.${sortBy}` : 'v.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Verifications retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get verification request details' })
  @ApiResponse({ status: 200, description: 'Verification details retrieved' })
  async getVerification(@Param('id') id: string) {
    const verification = await this.verificationRepository.findOne({
      where: { id: Number(id) },
      relations: ['user', 'verifiedByUser'],
    });

    if (!verification) {
      throw new NotFoundException({
        success: false,
        message: 'Verification record not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    return {
      success: true,
      message: 'Verification details retrieved successfully',
      data: verification,
    };
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a verification request' })
  @ApiResponse({ status: 200, description: 'Verification approved' })
  async approveVerification(
    @Param('id') id: string,
    @Body() dto: ApproveVerificationDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    const verification = await this.verificationRepository.findOne({ where: { id: Number(id) } });

    if (!verification) {
      throw new NotFoundException({
        success: false,
        message: 'Verification record not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    const adminUser = await this.userRepository.findOne({ where: { uuid: admin.sub } });

    verification.status = 'approved';
    verification.verifiedBy = adminUser?.id || null;
    verification.verifiedAt = new Date();
    if (dto.notes) {
      verification.metadata = { ...(verification.metadata as object || {}), notes: dto.notes };
    }

    await this.verificationRepository.save(verification);

    return {
      success: true,
      message: 'Verification approved successfully',
    };
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a verification request with reason' })
  @ApiResponse({ status: 200, description: 'Verification rejected' })
  async rejectVerification(
    @Param('id') id: string,
    @Body() dto: RejectVerificationDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    const verification = await this.verificationRepository.findOne({ where: { id: Number(id) } });

    if (!verification) {
      throw new NotFoundException({
        success: false,
        message: 'Verification record not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    const adminUser = await this.userRepository.findOne({ where: { uuid: admin.sub } });

    verification.status = 'rejected';
    verification.rejectionReason = dto.reason;
    verification.verifiedBy = adminUser?.id || null;
    verification.verifiedAt = new Date();

    await this.verificationRepository.save(verification);

    return {
      success: true,
      message: 'Verification rejected',
    };
  }
}
