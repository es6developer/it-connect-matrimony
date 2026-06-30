import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { ProfilesService } from '../../src/modules/profiles/profiles.service';
import { S3Service } from '../../src/integrations/s3/s3.service';
import { User } from '../../src/database/entities/user.entity';
import { Profile } from '../../src/database/entities/profile.entity';
import { ProfessionalDetail } from '../../src/database/entities/professional-detail.entity';
import { EducationDetail } from '../../src/database/entities/education-detail.entity';
import { FamilyDetail } from '../../src/database/entities/family-detail.entity';
import { LifestyleDetail } from '../../src/database/entities/lifestyle-detail.entity';
import { Language } from '../../src/database/entities/language.entity';
import { HoroscopeDetail } from '../../src/database/entities/horoscope-detail.entity';
import { PartnerPreference } from '../../src/database/entities/partner-preference.entity';
import { Photo } from '../../src/database/entities/photo.entity';
import { Video } from '../../src/database/entities/video.entity';
import { Gender, UserRole, UserStatus, Diet } from '../../src/common/enums';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let userRepo: any;
  let profileRepo: any;
  let professionalRepo: any;
  let educationRepo: any;
  let familyRepo: any;
  let lifestyleRepo: any;
  let languageRepo: any;
  let horoscopeRepo: any;
  let preferenceRepo: any;
  let photoRepo: any;
  let videoRepo: any;
  let photoModerationQueue: any;
  let s3Service: any;

  const baseUser: Partial<User> = {
    id: 1,
    uuid: 'user-uuid-1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hash',
    gender: Gender.MALE,
    dateOfBirth: '1995-06-15',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    phone: '+919876543210',
    emailVerifiedAt: new Date(),
    profileCompletionPercentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfile = {
    id: 1,
    userId: 1,
    headline: 'SWE at Google',
    aboutMe: 'I am a software engineer passionate about building great products.',
    bio: null,
    dateOfBirth: '1995-06-15',
    age: 29,
    gender: Gender.MALE,
    maritalStatus: 'never_married',
    religion: 'hindu',
    motherTongue: 'tamil',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    hideProfile: false,
    hidePhotos: false,
    hideContact: false,
    privateMode: false,
  };

  beforeEach(async () => {
    const mockRepo = () => ({
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
    });

    userRepo = mockRepo();
    profileRepo = mockRepo();
    professionalRepo = mockRepo();
    educationRepo = mockRepo();
    familyRepo = mockRepo();
    lifestyleRepo = mockRepo();
    languageRepo = mockRepo();
    horoscopeRepo = mockRepo();
    preferenceRepo = mockRepo();
    photoRepo = mockRepo();
    videoRepo = mockRepo();

    photoModerationQueue = { add: jest.fn() };
    s3Service = { uploadFile: jest.fn(), deleteFile: jest.fn(), getSignedUrl: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Profile), useValue: profileRepo },
        { provide: getRepositoryToken(ProfessionalDetail), useValue: professionalRepo },
        { provide: getRepositoryToken(EducationDetail), useValue: educationRepo },
        { provide: getRepositoryToken(FamilyDetail), useValue: familyRepo },
        { provide: getRepositoryToken(LifestyleDetail), useValue: lifestyleRepo },
        { provide: getRepositoryToken(Language), useValue: languageRepo },
        { provide: getRepositoryToken(HoroscopeDetail), useValue: horoscopeRepo },
        { provide: getRepositoryToken(PartnerPreference), useValue: preferenceRepo },
        { provide: getRepositoryToken(Photo), useValue: photoRepo },
        { provide: getRepositoryToken(Video), useValue: videoRepo },
        { provide: getQueueToken('photo-moderation'), useValue: photoModerationQueue },
        { provide: S3Service, useValue: s3Service },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  const mockUserWithRelations = (overrides: any = {}) => ({
    ...baseUser,
    profile: { ...mockProfile, ...overrides.profile },
    professionalDetail: overrides.professionalDetail || null,
    educationDetails: overrides.educationDetails || [],
    familyDetail: overrides.familyDetail || null,
    lifestyleDetail: overrides.lifestyleDetail || null,
    languages: overrides.languages || [],
    horoscopeDetail: overrides.horoscopeDetail || null,
    partnerPreference: overrides.partnerPreference || null,
    photos: overrides.photos || [],
    videos: overrides.videos || [],
  });

  describe('getCompleteProfile', () => {
    it('should return full user with all relations', async () => {
      const mockFullUser = mockUserWithRelations({ profile: mockProfile });
      userRepo.findOne.mockResolvedValue(mockFullUser);

      const result = await service.getCompleteProfile(1);

      expect(result).toEqual(mockFullUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: expect.arrayContaining(['profile', 'photos', 'videos']),
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getCompleteProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateBasic', () => {
    it('should update basic profile when it exists', async () => {
      userRepo.findOne.mockResolvedValue(mockUserWithRelations({ profile: mockProfile }));
      profileRepo.update.mockResolvedValue({ affected: 1 });
      profileRepo.findOne.mockResolvedValue({ ...mockProfile, headline: 'Updated Headline', aboutMe: 'Updated about' });

      const result = await service.updateBasic(1, { headline: 'Updated Headline', aboutMe: 'Updated about' } as any);

      expect(result.headline).toBe('Updated Headline');
      expect(profileRepo.update).toHaveBeenCalledWith({ userId: 1 }, { headline: 'Updated Headline', aboutMe: 'Updated about' });
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo, save to DB, and queue moderation', async () => {
      const file = { buffer: Buffer.from('test'), originalname: 'photo.jpg', mimetype: 'image/jpeg', size: 500000 } as Express.Multer.File;

      s3Service.uploadFile.mockResolvedValue({ key: 'users/1/photos/photo.jpg', url: 'https://s3.example.com/photo.jpg' });
      photoRepo.count.mockResolvedValue(0);
      photoRepo.create.mockReturnValue({ id: 1, url: 'https://s3.example.com/photo.jpg', isPrimary: true });
      photoRepo.save.mockResolvedValue({ id: 1, url: 'https://s3.example.com/photo.jpg', isPrimary: true });

      const result = await service.uploadPhoto(1, file);

      expect(result.isPrimary).toBe(true);
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        file.buffer,
        file.originalname,
        'users/1/photos',
        file.mimetype,
      );
      expect(photoModerationQueue.add).toHaveBeenCalledWith('moderate-photo', expect.objectContaining({ photoId: 1 }));
    });

    it('should reject files over 10MB', async () => {
      const file = { buffer: Buffer.alloc(11 * 1024 * 1024), originalname: 'large.jpg', mimetype: 'image/jpeg', size: 11 * 1024 * 1024 } as Express.Multer.File;

      await expect(service.uploadPhoto(1, file)).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid file types', async () => {
      const file = { buffer: Buffer.from(''), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 1000 } as Express.Multer.File;

      await expect(service.uploadPhoto(1, file)).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculateProfileCompletion', () => {
    it('should return 100% for a fully complete profile', async () => {
      const fullUser = mockUserWithRelations({
        profile: mockProfile,
        professionalDetail: { id: 1, userId: 1, designation: 'SWE', currentCompany: 'Google' },
        educationDetails: [{ id: 1, userId: 1, degree: 'B.Tech', university: 'IIT' }],
        familyDetail: { id: 1, userId: 1, fatherName: 'Raj', motherName: 'Lakshmi', familyType: 'nuclear' },
        lifestyleDetail: { id: 1, userId: 1, diet: Diet.VEGETARIAN, hobbies: 'Reading', interests: 'Tech' },
        languages: [{ id: 1, userId: 1, language: 'Tamil', proficiency: 'native' }],
        horoscopeDetail: { id: 1, userId: 1, rashi: 'Mesha', nakshatra: 'Ashwini', manglik: 'no' },
        partnerPreference: { id: 1, userId: 1, ageMin: 25, ageMax: 30 },
        photos: [{ id: 1, userId: 1, url: 'https://example.com/photo.jpg', isPrimary: true }],
      });

      userRepo.findOne.mockResolvedValue(fullUser);
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.calculateProfileCompletion(1);

      expect(result).toBe(100);
      expect(userRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        { profileCompletionPercentage: 100 },
      );
    });

    it('should return a lower score for an empty profile', async () => {
      const emptyUser = mockUserWithRelations({ profile: { userId: 1 } });

      userRepo.findOne.mockResolvedValue(emptyUser);
      userRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.calculateProfileCompletion(1);

      expect(result).toBeLessThan(40);
    });
  });

  describe('getPublicProfile', () => {
    it('should strip sensitive fields from public profile', async () => {
      const fullUser = mockUserWithRelations({ profile: { ...mockProfile, privateMode: false } });
      userRepo.findOne.mockResolvedValue(fullUser);

      const result = await service.getPublicProfile(1);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('twoFactorSecret');
      expect(result).toHaveProperty('firstName');
    });

    it('should return limited info when privateMode is on', async () => {
      const privateUser = mockUserWithRelations({ profile: { ...mockProfile, privateMode: true, hideProfile: true } });
      userRepo.findOne.mockResolvedValue(privateUser);

      const result = await service.getPublicProfile(1);

      expect(result).toHaveProperty('firstName');
      expect((result as any).profile?.hideProfile).toBe(true);
    });
  });

  describe('updateEducation', () => {
    it('should delete old and create new education records', async () => {
      educationRepo.delete.mockResolvedValue({ affected: 1 });
      educationRepo.create.mockImplementation((data: any) => data);
      educationRepo.save.mockResolvedValue([{ userId: 1, degree: 'B.Tech', university: 'IIT' }]);

      const result = await service.updateEducation(1, [{ degree: 'B.Tech', university: 'IIT' } as any]);

      expect(result).toHaveLength(1);
      expect(educationRepo.delete).toHaveBeenCalledWith({ userId: 1 });
    });
  });

  describe('updateProfessional', () => {
    it('should update existing professional detail', async () => {
      professionalRepo.findOne.mockResolvedValue({ id: 1, userId: 1, designation: 'Engineer' });
      professionalRepo.update.mockResolvedValue({ affected: 1 });
      professionalRepo.findOne.mockResolvedValue({ id: 1, userId: 1, designation: 'Senior Engineer', currentCompany: 'Google' });

      const result = await service.updateProfessional(1, { designation: 'Senior Engineer', currentCompany: 'Google' } as any);

      expect(result.designation).toBe('Senior Engineer');
    });
  });

  describe('calculateCompatibility', () => {
    it('should calculate score based on shared attributes', async () => {
      const user1 = mockUserWithRelations({
        profile: { ...mockProfile, religion: 'hindu', motherTongue: 'tamil' },
        lifestyleDetail: { id: 1, userId: 1, diet: Diet.VEGETARIAN, smoking: 'no', drinking: 'no' },
      });
      const user2 = mockUserWithRelations({
        profile: { ...mockProfile, userId: 2, religion: 'hindu', motherTongue: 'tamil' },
        lifestyleDetail: { id: 2, userId: 2, diet: Diet.VEGETARIAN, smoking: 'no', drinking: 'no' },
      });

      userRepo.findOne.mockResolvedValueOnce(user1);
      userRepo.findOne.mockResolvedValueOnce(user2);

      const result = await service.calculateCompatibility(1, 2);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });

    it('should return 0 when profiles are missing', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 1, uuid: 'u1', profile: null } as any);
      userRepo.findOne.mockResolvedValueOnce({ id: 2, uuid: 'u2', profile: null } as any);

      const result = await service.calculateCompatibility(1, 2);

      expect(result).toBe(0);
    });
  });
});
