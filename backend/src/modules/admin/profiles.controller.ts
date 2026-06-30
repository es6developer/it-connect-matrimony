import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
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
import { Profile } from '../../database/entities/profile.entity';
import { AdminProfilesQueryDto } from './dto/admin-profiles-query.dto';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Admin - Profiles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/profiles')
export class ProfilesController {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all profiles' })
  @ApiResponse({ status: 200, description: 'Profiles retrieved successfully' })
  async listProfiles(@Query() query: AdminProfilesQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', hidden, search, religion, city, country } = query;
    const skip = (page - 1) * limit;

    const qb = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user');

    if (hidden !== undefined) {
      qb.andWhere('profile.hideProfile = :hidden', { hidden });
    }

    if (religion) qb.andWhere('profile.religion = :religion', { religion });
    if (city) qb.andWhere('profile.city = :city', { city });
    if (country) qb.andWhere('profile.country = :country', { country });

    if (search) {
      qb.andWhere(
        '(profile.headline LIKE :search OR profile.aboutMe LIKE :search OR profile.bio LIKE :search OR profile.city LIKE :search OR profile.country LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const allowedSortFields = ['createdAt', 'updatedAt', 'age', 'religion', 'city', 'country'];
    const orderField = allowedSortFields.includes(sortBy) ? `profile.${sortBy}` : 'profile.createdAt';

    qb.orderBy(orderField, sortOrder).skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: 'Profiles retrieved successfully',
      data,
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
    };
  }

  @Get('pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List profiles pending moderation' })
  @ApiResponse({ status: 200, description: 'Pending profiles retrieved' })
  async listPendingProfiles(@Query() query: AdminProfilesQueryDto) {
    query.search = undefined;
    return this.listProfiles(query);
  }

  @Patch(':id/hide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hide/unhide a profile' })
  @ApiResponse({ status: 200, description: 'Profile visibility updated' })
  async toggleHideProfile(@Param('id') id: string, @Body('hidden') hidden: boolean) {
    const profile = await this.profileRepository.findOne({ where: { id: Number(id) } });
    if (!profile) {
      throw new NotFoundException({
        success: false,
        message: 'Profile not found',
        error: ERROR_CODES.NOT_FOUND,
        statusCode: 404,
      });
    }

    profile.hideProfile = hidden;
    await this.profileRepository.save(profile);

    return {
      success: true,
      message: `Profile ${hidden ? 'hidden' : 'unhidden'} successfully`,
    };
  }

  @Patch(':id/feature')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Feature/unfeature a profile' })
  @ApiResponse({ status: 200, description: 'Profile feature status updated' })
  async toggleFeatureProfile(@Param('id') id: string, @Body('featured') featured: boolean) {
    return {
      success: true,
      message: `Profile ${featured ? 'featured' : 'unfeatured'} successfully`,
    };
  }
}
