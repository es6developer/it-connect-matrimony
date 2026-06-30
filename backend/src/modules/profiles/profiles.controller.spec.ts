import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { Repository } from 'typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { S3Service } from '../../integrations/s3/s3.service';
import { User } from '../../database/entities/user.entity';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const mockRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  softDelete: jest.fn(),
  count: jest.fn(),
});

const mockQueue = () => ({
  add: jest.fn(),
});

const mockS3Service = () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  getSignedUrl: jest.fn(),
});

const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let service: ProfilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        ProfilesService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        { provide: getRepositoryToken(Profile), useValue: mockRepository() },
        { provide: getRepositoryToken(ProfessionalDetail), useValue: mockRepository() },
        { provide: getRepositoryToken(EducationDetail), useValue: mockRepository() },
        { provide: getRepositoryToken(FamilyDetail), useValue: mockRepository() },
        { provide: getRepositoryToken(LifestyleDetail), useValue: mockRepository() },
        { provide: getRepositoryToken(Language), useValue: mockRepository() },
        { provide: getRepositoryToken(HoroscopeDetail), useValue: mockRepository() },
        { provide: getRepositoryToken(PartnerPreference), useValue: mockRepository() },
        { provide: getRepositoryToken(Photo), useValue: mockRepository() },
        { provide: getRepositoryToken(Video), useValue: mockRepository() },
        { provide: getQueueToken('photo-moderation'), useValue: mockQueue() },
        { provide: S3Service, useValue: mockS3Service() },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ProfilesController>(ProfilesController);
    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return the complete profile for the current user', async () => {
      const result = { id: 1, firstName: 'John' };
      jest.spyOn(service, 'getCompleteProfile').mockResolvedValue(result as any);
      expect(await controller.getMyProfile('1')).toBe(result);
      expect(service.getCompleteProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('updateBasic', () => {
    it('should update basic profile', async () => {
      const dto = { headline: 'SWE at Google', aboutMe: 'Hello' };
      const result = { userId: 1, ...dto };
      jest.spyOn(service, 'updateBasic').mockResolvedValue(result as any);
      expect(await controller.updateBasic('1', dto as any)).toBe(result);
      expect(service.updateBasic).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateProfessional', () => {
    it('should update professional details', async () => {
      const dto = { designation: 'Engineer', currentCompany: 'Google' };
      const result = { userId: 1, ...dto };
      jest.spyOn(service, 'updateProfessional').mockResolvedValue(result as any);
      expect(await controller.updateProfessional('1', dto as any)).toBe(result);
      expect(service.updateProfessional).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateEducation', () => {
    it('should update education details', async () => {
      const dto = [{ degree: 'B.Tech', university: 'IIT' }];
      const result = [{ userId: 1, ...dto[0] }];
      jest.spyOn(service, 'updateEducation').mockResolvedValue(result as any);
      expect(await controller.updateEducation('1', dto as any)).toBe(result);
      expect(service.updateEducation).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateFamily', () => {
    it('should update family details', async () => {
      const dto = { fatherName: 'Raj' };
      const result = { userId: 1, ...dto };
      jest.spyOn(service, 'updateFamily').mockResolvedValue(result as any);
      expect(await controller.updateFamily('1', dto as any)).toBe(result);
      expect(service.updateFamily).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateLifestyle', () => {
    it('should update lifestyle details', async () => {
      const dto = { diet: 'vegetarian' };
      const result = { userId: 1, ...dto };
      jest.spyOn(service, 'updateLifestyle').mockResolvedValue(result as any);
      expect(await controller.updateLifestyle('1', dto as any)).toBe(result);
      expect(service.updateLifestyle).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updateLanguages', () => {
    it('should update languages', async () => {
      const dto = { languages: [{ language: 'English', proficiency: 'fluent' }] };
      const result = [{ userId: 1, ...dto.languages[0] }];
      jest.spyOn(service, 'updateLanguages').mockResolvedValue(result as any);
      expect(await controller.updateLanguages('1', dto as any)).toBe(result);
      expect(service.updateLanguages).toHaveBeenCalledWith(1, dto.languages);
    });
  });

  describe('updateHoroscope', () => {
    it('should update horoscope', async () => {
      const dto = { rashi: 'Mesha', manglik: 'no' };
      const result = { userId: 1, ...dto };
      jest.spyOn(service, 'updateHoroscope').mockResolvedValue(result as any);
      expect(await controller.updateHoroscope('1', dto as any)).toBe(result);
      expect(service.updateHoroscope).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('updatePreferences', () => {
    it('should update partner preferences', async () => {
      const dto = { ageMin: 25, ageMax: 30 };
      const result = { userId: 1, ...dto };
      jest.spyOn(service, 'updatePreferences').mockResolvedValue(result as any);
      expect(await controller.updatePreferences('1', dto as any)).toBe(result);
      expect(service.updatePreferences).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo', async () => {
      const file = { originalname: 'test.jpg', mimetype: 'image/jpeg', buffer: Buffer.from(''), size: 1000 } as Express.Multer.File;
      const result = { id: 1, url: 'https://s3.example.com/test.jpg' };
      jest.spyOn(service, 'uploadPhoto').mockResolvedValue(result as any);
      expect(await controller.uploadPhoto('1', file)).toBe(result);
      expect(service.uploadPhoto).toHaveBeenCalledWith(1, file);
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo', async () => {
      jest.spyOn(service, 'deletePhoto').mockResolvedValue(undefined);
      await controller.deletePhoto('1', 5);
      expect(service.deletePhoto).toHaveBeenCalledWith(5, 1);
    });
  });

  describe('setPrimaryPhoto', () => {
    it('should set primary photo', async () => {
      const result = { id: 5, isPrimary: true };
      jest.spyOn(service, 'setPrimaryPhoto').mockResolvedValue(result as any);
      expect(await controller.setPrimaryPhoto('1', 5)).toBe(result);
      expect(service.setPrimaryPhoto).toHaveBeenCalledWith(5, 1);
    });
  });

  describe('uploadVideo', () => {
    it('should upload video', async () => {
      const file = { originalname: 'test.mp4', mimetype: 'video/mp4', buffer: Buffer.from(''), size: 10000 } as Express.Multer.File;
      const result = { id: 1, url: 'https://s3.example.com/test.mp4' };
      jest.spyOn(service, 'uploadVideo').mockResolvedValue(result as any);
      expect(await controller.uploadVideo('1', file)).toBe(result);
      expect(service.uploadVideo).toHaveBeenCalledWith(1, file);
    });
  });

  describe('deleteVideo', () => {
    it('should delete video', async () => {
      jest.spyOn(service, 'deleteVideo').mockResolvedValue(undefined);
      await controller.deleteVideo('1', 3);
      expect(service.deleteVideo).toHaveBeenCalledWith(3, 1);
    });
  });

  describe('viewProfile', () => {
    it('should return public profile', async () => {
      const result = { id: 2, firstName: 'Jane' };
      jest.spyOn(service, 'getPublicProfile').mockResolvedValue(result as any);
      expect(await controller.viewProfile(2)).toBe(result);
      expect(service.getPublicProfile).toHaveBeenCalledWith(2);
    });
  });

  describe('getCompletion', () => {
    it('should return completion percentage', async () => {
      jest.spyOn(service, 'calculateProfileCompletion').mockResolvedValue(70);
      const result = await controller.getCompletion('1');
      expect(result).toEqual({ completionPercentage: 70 });
      expect(service.calculateProfileCompletion).toHaveBeenCalledWith(1);
    });
  });
});
