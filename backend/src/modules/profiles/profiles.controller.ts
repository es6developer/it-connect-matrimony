import {
  Controller, Get, Put, Post, Delete, Body, Param, UseGuards,
  UseInterceptors, UploadedFile, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProfilesService } from './profiles.service';
import { BasicProfileDto } from './dto/basic-profile.dto';
import { ProfessionalDetailDto } from './dto/professional-detail.dto';
import { EducationDetailDto } from './dto/education-detail.dto';
import { FamilyDetailDto } from './dto/family-detail.dto';
import { LifestyleDetailDto } from './dto/lifestyle-detail.dto';
import { LanguageItemDto, LanguagesDto } from './dto/language.dto';
import { HoroscopeDetailDto } from './dto/horoscope-detail.dto';
import { PartnerPreferenceDto } from './dto/partner-preference.dto';

@ApiTags('Profiles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  async getMyProfile(@CurrentUser('id') userId: number) {
    return this.profilesService.getCompleteProfile(userId);
  }

  @Put('me/basic')
  async updateBasic(
    @CurrentUser('id') userId: number,
    @Body() dto: BasicProfileDto,
  ) {
    return this.profilesService.updateBasic(userId, dto);
  }

  @Put('me/professional')
  async updateProfessional(
    @CurrentUser('id') userId: number,
    @Body() dto: ProfessionalDetailDto,
  ) {
    return this.profilesService.updateProfessional(userId, dto);
  }

  @Put('me/education')
  async updateEducation(
    @CurrentUser('id') userId: number,
    @Body() dto: EducationDetailDto[],
  ) {
    return this.profilesService.updateEducation(userId, dto);
  }

  @Put('me/family')
  async updateFamily(
    @CurrentUser('id') userId: number,
    @Body() dto: FamilyDetailDto,
  ) {
    return this.profilesService.updateFamily(userId, dto);
  }

  @Put('me/lifestyle')
  async updateLifestyle(
    @CurrentUser('id') userId: number,
    @Body() dto: LifestyleDetailDto,
  ) {
    return this.profilesService.updateLifestyle(userId, dto);
  }

  @Put('me/languages')
  async updateLanguages(
    @CurrentUser('id') userId: number,
    @Body() dto: LanguagesDto,
  ) {
    return this.profilesService.updateLanguages(userId, dto.languages);
  }

  @Put('me/horoscope')
  async updateHoroscope(
    @CurrentUser('id') userId: number,
    @Body() dto: HoroscopeDetailDto,
  ) {
    return this.profilesService.updateHoroscope(userId, dto);
  }

  @Put('me/preferences')
  async updatePreferences(
    @CurrentUser('id') userId: number,
    @Body() dto: PartnerPreferenceDto,
  ) {
    return this.profilesService.updatePreferences(userId, dto);
  }

  @Post('me/photos')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { photo: { type: 'string', format: 'binary' } },
    },
  })
  async uploadPhoto(
    @CurrentUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profilesService.uploadPhoto(userId, file);
  }

  @Delete('me/photos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePhoto(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) photoId: number,
  ) {
    await this.profilesService.deletePhoto(photoId, userId);
  }

  @Put('me/photos/:id/primary')
  async setPrimaryPhoto(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) photoId: number,
  ) {
    return this.profilesService.setPrimaryPhoto(photoId, userId);
  }

  @Post('me/videos')
  @UseInterceptors(FileInterceptor('video'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { video: { type: 'string', format: 'binary' } },
    },
  })
  async uploadVideo(
    @CurrentUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.profilesService.uploadVideo(userId, file);
  }

  @Delete('me/videos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVideo(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) videoId: number,
  ) {
    await this.profilesService.deleteVideo(videoId, userId);
  }

  @Get(':id')
  async viewProfile(@Param('id', ParseIntPipe) id: number) {
    return this.profilesService.getPublicProfile(id);
  }

  @Get('me/completion')
  async getCompletion(@CurrentUser('id') userId: number) {
    const percentage = await this.profilesService.calculateProfileCompletion(userId);
    return { completionPercentage: percentage };
  }

  @Put('me')
  async updateProfile(
    @CurrentUser('id') userId: number,
    @Body() dto: Record<string, any>,
  ) {
    const errors: string[] = [];

    const tryUpdate = async (label: string, fn: () => Promise<any>) => {
      try {
        await fn();
      } catch (e: any) {
        errors.push(`${label}: ${e.message}`);
        console.error(`[CombinedUpdate] ${label} failed:`, e.message);
      }
    };

    if (dto.name) {
      await tryUpdate('userName', () => this.profilesService.updateUserName(userId, dto.name));
    }
    const basicFields = ['dateOfBirth', 'gender', 'maritalStatus', 'religion', 'caste', 'motherTongue', 'country', 'state', 'city', 'bio', 'headline', 'aboutMe'];
    const basicPresent = basicFields.some(f => f in dto) || ('community' in dto) || ('height' in dto);
    if (basicPresent) {
      const partial: any = {};
      basicFields.forEach(f => { if (f in dto) partial[f] = dto[f]; });
      if (dto.community) partial.caste = dto.community;
      if (dto.height) partial.height = Number(dto.height);
      await tryUpdate('basic', () => this.profilesService.updateBasic(userId, partial));
    }

    const profMap: Record<string, string> = { company: 'currentCompany', designation: 'designation', experience: 'yearsOfExperience', salary: 'currentSalary', currency: 'currency', workMode: 'workMode' };
    const profPresent = Object.keys(profMap).some(k => k in dto);
    if (profPresent) {
      const partial: any = {};
      Object.entries(profMap).forEach(([from, to]) => { if (from in dto && dto[from] !== '') partial[to] = dto[from]; });
      if (partial.yearsOfExperience) partial.yearsOfExperience = Number(partial.yearsOfExperience);
      if (partial.currentSalary) partial.currentSalary = Number(partial.currentSalary);
      if (Object.keys(partial).length > 0) {
        await tryUpdate('professional', () => this.profilesService.updateProfessional(userId, partial));
      }
    }

    if ('highestEducation' in dto || 'college' in dto || 'graduationYear' in dto) {
      const eduDto: any = {};
      if (dto.highestEducation) eduDto.degree = dto.highestEducation;
      if (dto.college) eduDto.college = dto.college;
      if (dto.graduationYear) eduDto.yearOfPassing = Number(dto.graduationYear);
      eduDto.isHighestDegree = true;
      if (Object.keys(eduDto).length > 1) {
        await tryUpdate('education', () => this.profilesService.updateEducation(userId, [eduDto]));
      }
    }

    const familyFields = ['fatherName', 'motherName', 'familyType', 'familyValues'];
    if (familyFields.some(f => f in dto) || 'siblings' in dto) {
      const partial: any = {};
      familyFields.forEach(f => { if (f in dto && dto[f] !== '') partial[f] = dto[f]; });
      if ('siblings' in dto && dto.siblings !== '') partial.siblingsCount = Number(dto.siblings);
      if (Object.keys(partial).length > 0) {
        await tryUpdate('family', () => this.profilesService.updateFamily(userId, partial));
      }
    }

    const lifestyleFields = ['diet', 'drinking', 'smoking', 'hobbies'];
    if (lifestyleFields.some(f => f in dto)) {
      const partial: any = {};
      lifestyleFields.forEach(f => { if (f in dto && dto[f] !== '') partial[f] = dto[f]; });
      if (Object.keys(partial).length > 0) {
        await tryUpdate('lifestyle', () => this.profilesService.updateLifestyle(userId, partial));
      }
    }

    if ('languages' in dto && Array.isArray(dto.languages) && dto.languages.length > 0) {
      await tryUpdate('languages', () => this.profilesService.updateLanguages(
        userId, dto.languages.map((l: string) => ({ language: l, proficiency: 'fluent' })),
      ));
    }

    if (errors.length > 0) {
      throw new Error(`Profile update completed with errors: ${errors.join('; ')}`);
    }
    return this.profilesService.getCompleteProfile(userId);
  }
}
