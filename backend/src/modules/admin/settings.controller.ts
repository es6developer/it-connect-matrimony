import {
  Controller,
  Get,
  Put,
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
import { SiteSetting } from '../../database/entities/site-setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ERROR_CODES } from '../../common/constants';

@ApiTags('Admin - Settings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/settings')
export class SettingsController {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepository: Repository<SiteSetting>,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all site settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings() {
    const settings = await this.settingsRepository.find({ order: { group: 'ASC', key: 'ASC' } });

    const grouped: Record<string, Record<string, any>> = {};
    for (const setting of settings) {
      if (!grouped[setting.group]) {
        grouped[setting.group] = {};
      }
      let parsedValue: any = setting.value;
      if (setting.type === 'number') parsedValue = Number(setting.value);
      else if (setting.type === 'boolean') parsedValue = setting.value === 'true';
      else if (setting.type === 'json') {
        try { parsedValue = JSON.parse(setting.value); } catch { parsedValue = setting.value; }
      }
      grouped[setting.group][setting.key] = parsedValue;
    }

    return {
      success: true,
      message: 'Settings retrieved successfully',
      data: grouped,
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update site settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(@Body() dto: UpdateSettingsDto) {
    if (!dto.settings || Object.keys(dto.settings).length === 0) {
      return {
        success: true,
        message: 'No settings to update',
      };
    }

    for (const [key, value] of Object.entries(dto.settings)) {
      let existing = await this.settingsRepository.findOne({ where: { key } });

      const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
      const type = typeof value === 'number' ? 'number'
        : typeof value === 'boolean' ? 'boolean'
        : typeof value === 'object' ? 'json'
        : 'string';

      if (existing) {
        existing.value = serialized;
        existing.type = type;
        await this.settingsRepository.save(existing);
      } else {
        existing = this.settingsRepository.create({
          key,
          value: serialized,
          type,
          group: 'general',
        });
        await this.settingsRepository.save(existing);
      }
    }

    return {
      success: true,
      message: 'Settings updated successfully',
    };
  }
}
