import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { PhotoModerationService } from './services/photo-moderation.service';
import { Profile } from '../../database/entities/profile.entity';
import { ProfessionalDetail } from '../../database/entities/professional-detail.entity';
import { EducationDetail } from '../../database/entities/education-detail.entity';
import { FamilyDetail } from '../../database/entities/family-detail.entity';
import { LifestyleDetail } from '../../database/entities/lifestyle-detail.entity';
import { Language } from '../../database/entities/language.entity';
import { HoroscopeDetail } from '../../database/entities/horoscope-detail.entity';
import { PartnerPreference } from '../../database/entities/partner-preference.entity';
import { Photo } from '../../database/entities/photo.entity';
import { Video } from '../../database/entities/video.entity';
import { User } from '../../database/entities/user.entity';
import { S3Service } from '../../integrations/s3/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      ProfessionalDetail,
      EducationDetail,
      FamilyDetail,
      LifestyleDetail,
      Language,
      HoroscopeDetail,
      PartnerPreference,
      Photo,
      Video,
    ]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService, PhotoModerationService, S3Service],
  exports: [ProfilesService],
})
export class ProfilesModule {}
