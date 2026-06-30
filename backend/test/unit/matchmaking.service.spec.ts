import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { InterestsService } from '../../src/modules/matchmaking/interests.service';
import { MatchesService } from '../../src/modules/matchmaking/matches.service';
import { SearchService } from '../../src/modules/matchmaking/search.service';
import { CompatibilityService } from '../../src/modules/matchmaking/services/compatibility.service';
import { Interest } from '../../src/database/entities/interest.entity';
import { Notification } from '../../src/database/entities/notification.entity';
import { User } from '../../src/database/entities/user.entity';
import { Match } from '../../src/database/entities/match.entity';
import { Profile } from '../../src/database/entities/profile.entity';
import { SavedSearch } from '../../src/database/entities/saved-search.entity';
import { SearchHistory } from '../../src/database/entities/search-history.entity';
import { BlockedUser } from '../../src/database/entities/blocked-user.entity';
import { InterestStatus, Gender, UserRole, UserStatus } from '../../src/common/enums';

describe('InterestsService', () => {
  let interestsService: InterestsService;
  let interestRepo: any;
  let notificationRepo: any;
  let userRepo: any;
  let matchRepo: any;

  const mockFromUser = { id: 1, uuid: 'from-uuid', firstName: 'John', lastName: 'Doe', gender: Gender.MALE, status: UserStatus.ACTIVE };
  const mockToUser = { id: 2, uuid: 'to-uuid', firstName: 'Jane', lastName: 'Doe', gender: Gender.FEMALE, status: UserStatus.ACTIVE };

  const mockInterest = {
    id: 1,
    uuid: 'interest-uuid',
    fromUserId: 1,
    toUserId: 2,
    status: InterestStatus.SENT,
    message: 'Hello!',
    createdAt: new Date(),
    actionedAt: null,
    isRead: false,
    readAt: null,
    fromUser: mockFromUser,
    toUser: mockToUser,
  };

  beforeEach(async () => {
    interestRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    };
    notificationRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
    };
    matchRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestsService,
        { provide: getRepositoryToken(Interest), useValue: interestRepo },
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Match), useValue: matchRepo },
      ],
    }).compile();

    interestsService = module.get<InterestsService>(InterestsService);
  });

  describe('sendInterest', () => {
    it('should create interest and send notification', async () => {
      userRepo.findOne.mockResolvedValue(mockToUser);
      interestRepo.findOne.mockResolvedValue(null);
      interestRepo.create.mockReturnValue(mockInterest);
      interestRepo.save.mockResolvedValue(mockInterest);
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});

      const result = await interestsService.sendInterest(1, 2, { message: 'Hello!' });

      expect(result.status).toBe(InterestStatus.SENT);
      expect(result.message).toBe('Hello!');
      expect(notificationRepo.save).toHaveBeenCalled();
    });

    it('should throw when sending interest to self', async () => {
      await expect(
        interestsService.sendInterest(1, 1, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        interestsService.sendInterest(1, 999, {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('acceptInterest', () => {
    it('should accept interest and create match on mutual interest', async () => {
      interestRepo.findOne
        .mockResolvedValueOnce({ ...mockInterest, toUserId: 2 })
        .mockResolvedValueOnce({ ...mockInterest, fromUserId: 2, toUserId: 1, status: InterestStatus.ACCEPTED });

      interestRepo.save.mockResolvedValue({ ...mockInterest, status: InterestStatus.ACCEPTED });
      matchRepo.create.mockReturnValue({});
      matchRepo.save.mockResolvedValue([]);
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});

      const result = await interestsService.acceptInterest(1, 2);

      expect(result.status).toBe(InterestStatus.ACCEPTED);
      expect(matchRepo.save).toHaveBeenCalled();
    });

    it('should reject when interest not addressed to user', async () => {
      interestRepo.findOne.mockResolvedValue(mockInterest);

      await expect(
        interestsService.acceptInterest(1, 3),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectInterest', () => {
    it('should decline interest and notify sender', async () => {
      interestRepo.findOne.mockResolvedValue({ ...mockInterest, toUserId: 2 });
      interestRepo.save.mockResolvedValue({ ...mockInterest, status: InterestStatus.DECLINED });
      notificationRepo.create.mockReturnValue({});
      notificationRepo.save.mockResolvedValue({});

      const result = await interestsService.rejectInterest(1, 2);

      expect(result.status).toBe(InterestStatus.DECLINED);
    });
  });
});

describe('MatchesService', () => {
  let matchesService: MatchesService;
  let matchRepo: any;
  let userRepo: any;
  let compatibilityService: any;

  beforeEach(async () => {
    matchRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      find: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
    };
    compatibilityService = {
      calculateScore: jest.fn().mockReturnValue({ score: 85, breakdown: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: matchRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: CompatibilityService, useValue: compatibilityService },
      ],
    }).compile();

    matchesService = module.get<MatchesService>(MatchesService);
  });

  describe('createMatch', () => {
    it('should create a match with compatibility score', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 1, profile: { gender: Gender.MALE }, professionalDetail: {}, educationDetails: [], lifestyleDetail: {}, horoscopeDetail: {} });
      userRepo.findOne.mockResolvedValueOnce({ id: 2, profile: { gender: Gender.FEMALE }, professionalDetail: {}, educationDetails: [], lifestyleDetail: {}, horoscopeDetail: {} });
      matchRepo.findOne.mockResolvedValue(null);
      matchRepo.create.mockReturnValue({ id: 1, userId: 1, matchedUserId: 2, compatibilityScore: 85 });
      matchRepo.save.mockResolvedValue({ id: 1, userId: 1, matchedUserId: 2, compatibilityScore: 85 });

      const result = await matchesService.createMatch(1, 2);

      expect(result.compatibilityScore).toBe(85);
      expect(compatibilityService.calculateScore).toHaveBeenCalled();
    });
  });

  describe('getMatches', () => {
    it('should return paginated matches', async () => {
      matchRepo.findAndCount.mockResolvedValue([[{ id: 1, matchedUser: { profile: {} } }], 1]);

      const result = await matchesService.getMatches(1);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});

describe('SearchService', () => {
  let searchService: SearchService;
  let profileRepo: any;
  let userRepo: any;
  let interestRepo: any;
  let matchRepo: any;
  let blockedUserRepo: any;
  let savedSearchRepo: any;
  let searchHistoryRepo: any;

  beforeEach(async () => {
    userRepo = { findOne: jest.fn(), find: jest.fn() };
    profileRepo = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    };
    interestRepo = { find: jest.fn() };
    matchRepo = { find: jest.fn() };
    blockedUserRepo = { find: jest.fn() };
    savedSearchRepo = { create: jest.fn(), save: jest.fn(), find: jest.fn(), findOne: jest.fn(), remove: jest.fn() };
    searchHistoryRepo = { create: jest.fn(), save: jest.fn(), findAndCount: jest.fn(), find: jest.fn(), remove: jest.fn(), delete: jest.fn(), count: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Profile), useValue: profileRepo },
        { provide: getRepositoryToken(SavedSearch), useValue: savedSearchRepo },
        { provide: getRepositoryToken(SearchHistory), useValue: searchHistoryRepo },
        { provide: getRepositoryToken(BlockedUser), useValue: blockedUserRepo },
        { provide: getRepositoryToken(Interest), useValue: interestRepo },
        { provide: getRepositoryToken(Match), useValue: matchRepo },
      ],
    }).compile();

    searchService = module.get<SearchService>(SearchService);
  });

  describe('searchProfiles', () => {
    it('should search with filters and exclude blocked/interested users', async () => {
      const mockQueryBuilder = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 3, user: { id: 3, firstName: 'Alice' } }], 1]),
      };

      userRepo.findOne.mockResolvedValue({ id: 1, profile: { gender: Gender.MALE } });
      blockedUserRepo.find.mockResolvedValue([]);
      interestRepo.find.mockResolvedValue([]);
      matchRepo.find.mockResolvedValue([]);
      profileRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      searchHistoryRepo.create.mockReturnValue({});
      searchHistoryRepo.save.mockResolvedValue({});
      searchHistoryRepo.count.mockResolvedValue(0);

      const result = await searchService.searchProfiles(1, { gender: Gender.FEMALE, ageMin: 25, ageMax: 35, city: 'Chennai', page: 1, limit: 20 });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'profile.age >= :ageMin', { ageMin: 25 },
      );
    });
  });

  describe('saveSearch', () => {
    it('should persist a saved search', async () => {
      savedSearchRepo.create.mockReturnValue({ id: 1, name: 'My Search', filters: { city: 'Bangalore' } });
      savedSearchRepo.save.mockResolvedValue({ id: 1, name: 'My Search', filters: { city: 'Bangalore' } });

      const result = await searchService.saveSearch(1, 'My Search', { city: 'Bangalore' });

      expect(result.name).toBe('My Search');
    });
  });
});
