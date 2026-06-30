import {
  Injectable, NotFoundException, Logger, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { ProfessionalDetail } from '../../database/entities/professional-detail.entity';
import { EducationDetail } from '../../database/entities/education-detail.entity';
import { FamilyDetail } from '../../database/entities/family-detail.entity';
import { LifestyleDetail } from '../../database/entities/lifestyle-detail.entity';
import { Language } from '../../database/entities/language.entity';
import { LanguageItemDto } from './dto/language.dto';
import { HoroscopeDetail } from '../../database/entities/horoscope-detail.entity';
import { PartnerPreference } from '../../database/entities/partner-preference.entity';
import { Photo } from '../../database/entities/photo.entity';
import { Video } from '../../database/entities/video.entity';
import { BasicProfileDto } from './dto/basic-profile.dto';
import { ProfessionalDetailDto } from './dto/professional-detail.dto';
import { EducationDetailDto } from './dto/education-detail.dto';
import { FamilyDetailDto } from './dto/family-detail.dto';
import { LifestyleDetailDto } from './dto/lifestyle-detail.dto';
import { HoroscopeDetailDto } from './dto/horoscope-detail.dto';
import { PartnerPreferenceDto } from './dto/partner-preference.dto';
import { S3Service } from '../../integrations/s3/s3.service';

type DeepPartial<T> = { [P in keyof T]?: T[P] | null };

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(ProfessionalDetail)
    private readonly professionalRepo: Repository<ProfessionalDetail>,
    @InjectRepository(EducationDetail)
    private readonly educationRepo: Repository<EducationDetail>,
    @InjectRepository(FamilyDetail)
    private readonly familyRepo: Repository<FamilyDetail>,
    @InjectRepository(LifestyleDetail)
    private readonly lifestyleRepo: Repository<LifestyleDetail>,
    @InjectRepository(Language)
    private readonly languageRepo: Repository<Language>,
    @InjectRepository(HoroscopeDetail)
    private readonly horoscopeRepo: Repository<HoroscopeDetail>,
    @InjectRepository(PartnerPreference)
    private readonly preferenceRepo: Repository<PartnerPreference>,
    @InjectRepository(Photo)
    private readonly photoRepo: Repository<Photo>,
    @InjectRepository(Video)
    private readonly videoRepo: Repository<Video>,
    private readonly s3Service: S3Service,
  ) {}

  private readonly profileRelations = [
    'profile',
    'professionalDetail',
    'educationDetails',
    'familyDetail',
    'lifestyleDetail',
    'languages',
    'horoscopeDetail',
    'partnerPreference',
    'photos',
    'videos',
  ] as const;

  private async findUserOrFail(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: [...this.profileRelations],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  getCompleteProfile(id: number): Promise<User> {
    return this.findUserOrFail(id);
  }

  async updateUserName(userId: number, name: string): Promise<void> {
    const uid = Number(userId);
    await this.userRepo.query(`UPDATE users SET first_name = '${name.replace(/'/g, "\\'")}' WHERE id = ${uid}`);
  }

  async updateBasic(userId: number, dto: BasicProfileDto): Promise<Profile> {
    const user = await this.findUserOrFail(userId);
    if (!user.profile) {
      const existing = await this.profileRepo.findOne({ where: { userId } });
      if (!existing) {
        const uid = Number(userId);
        await this.profileRepo.query(`INSERT INTO profiles (user_id) VALUES (${uid})`);
      }
      if (Object.keys(dto).length > 0) {
        await this.profileRepo.update({ userId }, dto as DeepPartial<Profile>);
      }
      return this.profileRepo.findOne({ where: { userId } }) as Promise<Profile>;
    }
    await this.profileRepo.update({ userId }, dto as DeepPartial<Profile>);
    return this.profileRepo.findOne({ where: { userId } }) as Promise<Profile>;
  }

  async updateProfessional(userId: number, dto: ProfessionalDetailDto): Promise<ProfessionalDetail> {
    const existing = await this.professionalRepo.findOne({ where: { userId } });
    if (existing) {
      await this.professionalRepo.update({ userId }, dto as DeepPartial<ProfessionalDetail>);
      return this.professionalRepo.findOne({ where: { userId } }) as Promise<ProfessionalDetail>;
    }
    const uid = Number(userId);
    await this.professionalRepo.query(`INSERT INTO professional_details (user_id) VALUES (${uid})`);
    if (Object.keys(dto).length > 0) {
      await this.professionalRepo.update({ userId }, dto as DeepPartial<ProfessionalDetail>);
    }
    return this.professionalRepo.findOne({ where: { userId } }) as Promise<ProfessionalDetail>;
  }

  async updateEducation(userId: number, dto: EducationDetailDto[]): Promise<EducationDetail[]> {
    await this.educationRepo.delete({ userId });
    if (dto.length === 0) return [];
    const uid = Number(userId);
    for (const item of dto) {
      const degree = item.degree ? `'${item.degree.replace(/'/g, "\\'")}'` : 'NULL';
      const college = item.college ? `'${item.college.replace(/'/g, "\\'")}'` : 'NULL';
      const university = item.university ? `'${item.university.replace(/'/g, "\\'")}'` : 'NULL';
      const yop = item.yearOfPassing ?? 'NULL';
      const isHighest = item.isHighestDegree ?? false;
      await this.educationRepo.query(
        `INSERT INTO education_details (user_id, degree, college, university, year_of_passing, is_highest_degree) VALUES (${uid}, ${degree}, ${college}, ${university}, ${yop}, ${isHighest})`,
      );
    }
    return this.educationRepo.find({ where: { userId } }) as Promise<EducationDetail[]>;
  }

  async updateFamily(userId: number, dto: FamilyDetailDto): Promise<FamilyDetail> {
    const existing = await this.familyRepo.findOne({ where: { userId } });
    if (existing) {
      await this.familyRepo.update({ userId }, dto as DeepPartial<FamilyDetail>);
      return this.familyRepo.findOne({ where: { userId } }) as Promise<FamilyDetail>;
    }
    const uid = Number(userId);
    await this.familyRepo.query(`INSERT INTO family_details (user_id) VALUES (${uid})`);
    if (Object.keys(dto).length > 0) {
      await this.familyRepo.update({ userId }, dto as DeepPartial<FamilyDetail>);
    }
    return this.familyRepo.findOne({ where: { userId } }) as Promise<FamilyDetail>;
  }

  async updateLifestyle(userId: number, dto: LifestyleDetailDto): Promise<LifestyleDetail> {
    const existing = await this.lifestyleRepo.findOne({ where: { userId } });
    if (existing) {
      await this.lifestyleRepo.update({ userId }, dto as DeepPartial<LifestyleDetail>);
      return this.lifestyleRepo.findOne({ where: { userId } }) as Promise<LifestyleDetail>;
    }
    const uid = Number(userId);
    await this.lifestyleRepo.query(`INSERT INTO lifestyle_details (user_id) VALUES (${uid})`);
    if (Object.keys(dto).length > 0) {
      await this.lifestyleRepo.update({ userId }, dto as DeepPartial<LifestyleDetail>);
    }
    return this.lifestyleRepo.findOne({ where: { userId } }) as Promise<LifestyleDetail>;
  }

  async updateLanguages(userId: number, dto: LanguageItemDto[]): Promise<Language[]> {
    await this.languageRepo.delete({ userId });
    if (dto.length === 0) return [];
    const uid = Number(userId);
    for (const item of dto) {
      const lang = item.language.replace(/'/g, "\\'");
      const prof = item.proficiency ? `'${item.proficiency.replace(/'/g, "\\'")}'` : 'NULL';
      await this.languageRepo.query(
        `INSERT INTO languages (user_id, language, proficiency) VALUES (${uid}, '${lang}', ${prof})`,
      );
    }
    return this.languageRepo.find({ where: { userId } }) as Promise<Language[]>;
  }

  async updateHoroscope(userId: number, dto: HoroscopeDetailDto): Promise<HoroscopeDetail> {
    const existing = await this.horoscopeRepo.findOne({ where: { userId } });
    if (existing) {
      await this.horoscopeRepo.update({ userId }, dto as DeepPartial<HoroscopeDetail>);
      return this.horoscopeRepo.findOne({ where: { userId } }) as Promise<HoroscopeDetail>;
    }
    const uid = Number(userId);
    await this.horoscopeRepo.query(`INSERT INTO horoscope_details (user_id) VALUES (${uid})`);
    if (Object.keys(dto).length > 0) {
      await this.horoscopeRepo.update({ userId }, dto as DeepPartial<HoroscopeDetail>);
    }
    return this.horoscopeRepo.findOne({ where: { userId } }) as Promise<HoroscopeDetail>;
  }

  async updatePreferences(userId: number, dto: PartnerPreferenceDto): Promise<PartnerPreference> {
    const existing = await this.preferenceRepo.findOne({ where: { userId } });
    if (existing) {
      await this.preferenceRepo.update({ userId }, dto as DeepPartial<PartnerPreference>);
      return this.preferenceRepo.findOne({ where: { userId } }) as Promise<PartnerPreference>;
    }
    const uid = Number(userId);
    await this.preferenceRepo.query(`INSERT INTO partner_preferences (user_id) VALUES (${uid})`);
    if (Object.keys(dto).length > 0) {
      await this.preferenceRepo.update({ userId }, dto as DeepPartial<PartnerPreference>);
    }
    return this.preferenceRepo.findOne({ where: { userId } }) as Promise<PartnerPreference>;
  }

  async uploadPhoto(
    userId: number,
    file: Express.Multer.File,
  ): Promise<Photo> {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Photo must be under 10MB');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    const { key, url } = await this.s3Service.uploadFile(
      file.buffer,
      file.originalname,
      `users/${userId}/photos`,
      file.mimetype,
    );

    const count = await this.photoRepo.count({ where: { userId } });

    const uid = Number(userId);
    const url_esc = url.replace(/'/g, "\\'");
    const mimetype_esc = file.mimetype.replace(/'/g, "\\'");
    await this.photoRepo.query(
      `INSERT INTO photos (user_id, url, file_size, mime_type, is_primary, upload_order) VALUES (${uid}, '${url_esc}', ${file.size}, '${mimetype_esc}', ${count === 0}, ${count + 1})`,
    );
    const saved = await this.photoRepo.findOne({ where: { userId }, order: { id: 'DESC' } }) as Photo;

    return saved;
  }

  async deletePhoto(photoId: number, userId: number): Promise<void> {
    const photo = await this.photoRepo.findOne({ where: { id: photoId, userId } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
    const key = this.extractKeyFromUrl(photo.url);
    if (key) {
      await this.s3Service.deleteFile(key);
    }
    if (photo.thumbnailUrl) {
      const thumbKey = this.extractKeyFromUrl(photo.thumbnailUrl);
      if (thumbKey) {
        await this.s3Service.deleteFile(thumbKey);
      }
    }
    await this.photoRepo.softDelete(photoId);
  }

  async setPrimaryPhoto(photoId: number, userId: number): Promise<Photo> {
    const photo = await this.photoRepo.findOne({ where: { id: photoId, userId } });
    if (!photo) {
      throw new NotFoundException('Photo not found');
    }
    await this.photoRepo.update({ userId }, { isPrimary: false });
    photo.isPrimary = true;
    return this.photoRepo.save(photo);
  }

  async uploadVideo(
    userId: number,
    file: Express.Multer.File,
  ): Promise<Video> {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Video must be under 50MB');
    }

    const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: MP4, WebM, OGG, MOV');
    }

    const { key, url } = await this.s3Service.uploadFile(
      file.buffer,
      file.originalname,
      `users/${userId}/videos`,
      file.mimetype,
    );

    const video = this.videoRepo.create({
      userId,
      url,
      fileSize: file.size,
    });

    return this.videoRepo.save(video);
  }

  async deleteVideo(videoId: number, userId: number): Promise<void> {
    const video = await this.videoRepo.findOne({ where: { id: videoId, userId } });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    const key = this.extractKeyFromUrl(video.url);
    if (key) {
      await this.s3Service.deleteFile(key);
    }
    if (video.thumbnailUrl) {
      const thumbKey = this.extractKeyFromUrl(video.thumbnailUrl);
      if (thumbKey) {
        await this.s3Service.deleteFile(thumbKey);
      }
    }
    await this.videoRepo.delete(videoId);
  }

  async getPublicProfile(id: number): Promise<Partial<User>> {
    const user = await this.findUserOrFail(id);
    if (user.profile?.privateMode) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: {
          headline: user.profile.headline,
          age: user.profile.age,
          gender: user.profile.gender,
          religion: user.profile.religion,
          motherTongue: user.profile.motherTongue,
          maritalStatus: user.profile.maritalStatus,
          country: user.profile.country,
          state: user.profile.state,
          city: user.profile.city,
          hideProfile: true,
        } as Profile,
      };
    }

    const profile = user.profile;
    if (profile) {
      if (profile.hidePhotos) {
        user.photos = [];
      }
      if (profile.hideContact) {
        user.email = undefined as unknown as string;
        user.phone = undefined as unknown as string;
      }
    }

    const { passwordHash, twoFactorSecret, twoFactorRecoveryCodes, oauthId, referralCode, referredBy, ipAddress, deviceInfo, ...safeUser } = user;
    return safeUser;
  }

  async calculateProfileCompletion(userId: number): Promise<number> {
    const user = await this.findUserOrFail(userId);
    let score = 0;
    const total = 10;

    if (user.profile) {
      const p = user.profile;
      const basicFields = [
        p.headline, p.aboutMe, p.dateOfBirth, p.gender,
        p.maritalStatus, p.religion, p.motherTongue, p.height,
        p.country, p.state, p.city,
      ];
      if (basicFields.some((f) => f !== null && f !== undefined)) score += 1;
      if (p.aboutMe && p.aboutMe.length >= 50) score += 1;
    }

    if (user.professionalDetail) {
      const pd = user.professionalDetail;
      if (pd.designation || pd.currentCompany) score += 1;
    }

    if (user.educationDetails && user.educationDetails.length > 0) {
      score += 1;
    }

    if (user.familyDetail) {
      const fd = user.familyDetail;
      if (fd.fatherName || fd.motherName || fd.familyType) score += 1;
    }

    if (user.lifestyleDetail) {
      const ld = user.lifestyleDetail;
      if (ld.diet || ld.hobbies || ld.interests) score += 1;
    }

    if (user.languages && user.languages.length > 0) {
      score += 1;
    }

    if (user.horoscopeDetail) {
      const hd = user.horoscopeDetail;
      if (hd.rashi || hd.nakshatra || hd.manglik) score += 1;
    }

    if (user.partnerPreference) {
      score += 1;
    }

    if (user.photos && user.photos.length > 0) {
      score += 1;
    }

    const percentage = Math.round((score / total) * 100);
    await this.userRepo.update({ id: userId }, { profileCompletionPercentage: percentage });
    return percentage;
  }

  async calculateCompatibility(user1Id: number, user2Id: number): Promise<number> {
    const [user1, user2] = await Promise.all([
      this.findUserOrFail(user1Id),
      this.findUserOrFail(user2Id),
    ]);

    let score = 0;
    const maxScore = 100;

    if (!user1.profile || !user2.profile) return 0;

    if (user1.profile.religion && user2.profile.religion &&
        user1.profile.religion === user2.profile.religion) {
      score += 15;
    }

    if (user1.profile.motherTongue && user2.profile.motherTongue &&
        user1.profile.motherTongue === user2.profile.motherTongue) {
      score += 10;
    }

    if (user1.profile.country && user2.profile.country &&
        user1.profile.country === user2.profile.country) {
      score += 10;
    }

    if (user1.profile.state && user2.profile.state &&
        user1.profile.state === user2.profile.state) {
      score += 5;
    }

    if (user1.profile.diet && user2.profile.diet &&
        user1.profile.diet === user2.profile.diet) {
      score += 10;
    }

    if (user1.profile.smoking && user2.profile.smoking &&
        user1.profile.smoking === user2.profile.smoking) {
      score += 5;
    }

    if (user1.profile.drinking && user2.profile.drinking &&
        user1.profile.drinking === user2.profile.drinking) {
      score += 5;
    }

    if (user1.lifestyleDetail && user2.lifestyleDetail) {
      if (user1.lifestyleDetail.diet === user2.lifestyleDetail.diet) score += 5;
      if (user1.lifestyleDetail.smoking === user2.lifestyleDetail.smoking) score += 5;
      if (user1.lifestyleDetail.drinking === user2.lifestyleDetail.drinking) score += 5;
    }

    if (user1.horoscopeDetail && user2.horoscopeDetail) {
      if (user1.horoscopeDetail.manglik === user2.horoscopeDetail.manglik) {
        score += 10;
      }
    }

    if (user1.educationDetails?.length && user2.educationDetails?.length) {
      const sameField = user1.educationDetails.some((e1) =>
        user2.educationDetails.some((e2) => e1.degree === e2.degree),
      );
      if (sameField) score += 5;
    }

    if (user1.professionalDetail && user2.professionalDetail) {
      if (user1.professionalDetail.workMode === user2.professionalDetail.workMode) {
        score += 5;
      }
    }

    if (user1.languages?.length && user2.languages?.length) {
      const commonLang = user1.languages.some((l1) =>
        user2.languages.some((l2) => l1.language === l2.language),
      );
      if (commonLang) score += 5;
    }

    return Math.min(score, maxScore);
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  }
}
