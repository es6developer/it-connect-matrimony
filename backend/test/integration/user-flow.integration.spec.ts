import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../../src/modules/auth/auth.service';
import { UsersService } from '../../src/modules/users/users.service';
import { ProfilesService } from '../../src/modules/profiles/profiles.service';
import { InterestsService } from '../../src/modules/matchmaking/interests.service';
import { ChatService } from '../../src/modules/chat/chat.service';
import { S3Service } from '../../src/integrations/s3/s3.service';
import { CompatibilityService } from '../../src/modules/matchmaking/services/compatibility.service';
import { REDIS_CLIENT } from '../../src/modules/auth/auth.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Gender, UserRole, UserStatus, InterestStatus, Diet } from '../../src/common/enums';

import { User } from '../../src/database/entities/user.entity';
import { Session } from '../../src/database/entities/session.entity';
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
import { Interest } from '../../src/database/entities/interest.entity';
import { Notification } from '../../src/database/entities/notification.entity';
import { Match } from '../../src/database/entities/match.entity';
import { Conversation } from '../../src/database/entities/conversation.entity';
import { ConversationParticipant } from '../../src/database/entities/conversation-participant.entity';
import { Message } from '../../src/database/entities/message.entity';
import { Report } from '../../src/database/entities/report.entity';
import { UserActivity } from '../../src/database/entities/user-activity.entity';

jest.mock('bcrypt');

describe('User Flow Integration: Register -> Complete Profile -> Search -> Interest -> Accept -> Chat', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let profilesService: ProfilesService;
  let interestsService: InterestsService;
  let chatService: ChatService;

  const mockRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softRemove: jest.fn(),
    recover: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    softDelete: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
  });

  let user1Id = 1;
  let user2Id = 2;
  let user1Uuid = 'user1-flow-uuid';
  let user2Uuid = 'user2-flow-uuid';
  let conversationUuid = 'conv-flow-uuid';

  beforeAll(async () => {
    const userRepo = mockRepo();
    const profileRepo = mockRepo();
    const professionalRepo = mockRepo();
    const educationRepo = mockRepo();
    const familyRepo = mockRepo();
    const lifestyleRepo = mockRepo();
    const languageRepo = mockRepo();
    const horoscopeRepo = mockRepo();
    const preferenceRepo = mockRepo();
    const photoRepo = mockRepo();
    const videoRepo = mockRepo();
    const interestRepo = mockRepo();
    const notificationRepo = mockRepo();
    const matchRepo = mockRepo();
    const conversationRepo = mockRepo();
    const participantRepo = mockRepo();
    const messageRepo = mockRepo();
    const reportRepo = mockRepo();
    const userActivityRepo = mockRepo();
    const sessionRepo = mockRepo();

    const mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('flow-test-token'),
      verifyAsync: jest.fn(),
    };

    const mockConfig = {
      get: jest.fn((key: string, dv?: any) => {
        const map: Record<string, any> = {
          'jwt.secret': 'test-secret',
          'jwt.refreshSecret': 'test-refresh',
          'jwt.expiry': '15m',
          'jwt.refreshExpiry': '7d',
          'aws.region': 'us-east-1',
          'aws.accessKeyId': 'key',
          'aws.secretAccessKey': 'secret',
          'aws.s3Bucket': 'bucket',
        };
        return map[key] ?? dv;
      }),
    };

    const mockRedis = { get: jest.fn(), setex: jest.fn(), del: jest.fn() };
    const mockQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        ProfilesService,
        InterestsService,
        ChatService,
        { provide: CompatibilityService, useValue: { calculateScore: jest.fn().mockReturnValue({ score: 85, breakdown: {} }) } },
        { provide: S3Service, useValue: { uploadFile: jest.fn().mockResolvedValue({ key: 'test', url: 'https://example.com/test.jpg' }), deleteFile: jest.fn() } },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Session), useValue: sessionRepo },
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
        { provide: getRepositoryToken(Interest), useValue: interestRepo },
        { provide: getRepositoryToken(Notification), useValue: notificationRepo },
        { provide: getRepositoryToken(Match), useValue: matchRepo },
        { provide: getRepositoryToken(Conversation), useValue: conversationRepo },
        { provide: getRepositoryToken(ConversationParticipant), useValue: participantRepo },
        { provide: getRepositoryToken(Message), useValue: messageRepo },
        { provide: getRepositoryToken(Report), useValue: reportRepo },
        { provide: getRepositoryToken(UserActivity), useValue: userActivityRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
        { provide: REDIS_CLIENT, useValue: mockRedis },
        { provide: getQueueToken('email'), useValue: mockQueue },
        { provide: getQueueToken('sms'), useValue: mockQueue },
        { provide: getQueueToken('photo-moderation'), useValue: mockQueue },
        { provide: getQueueToken('chat:message'), useValue: mockQueue },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    profilesService = module.get<ProfilesService>(ProfilesService);
    interestsService = module.get<InterestsService>(InterestsService);
    chatService = module.get<ChatService>(ChatService);
  });

  it('should complete the full user flow', async () => {
    const userRepo = (authService as any).userRepository;
    const interestRepo = (interestsService as any).interestRepo;
    const matchRepo = (interestsService as any).matchRepo;
    const profileRepo = (usersService as any).profileRepository;

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    userRepo.findOne.mockResolvedValue(null);
    userRepo.create.mockImplementation((data: any) => data);
    userRepo.save.mockImplementation((data: any) => Promise.resolve({ ...data, id: data.uuid === user1Uuid ? 1 : 2, uuid: data.uuid, profile: {} }));
    profileRepo.create.mockReturnValue({ id: 1, userId: 1 });
    profileRepo.save.mockResolvedValue({ id: 1, userId: 1 });

    const regResult = await authService.register({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      password: 'StrongP@ss1',
      gender: Gender.FEMALE,
      dateOfBirth: '1995-06-15',
    });

    expect(regResult.success).toBe(true);

    user1Uuid = regResult.data.user.uuid;

    userRepo.findOne.mockResolvedValue({
      id: 1, uuid: user1Uuid, profile: null, professionalDetail: null,
      educationDetails: [], familyDetail: null, lifestyleDetail: null,
      languages: [], horoscopeDetail: null, partnerPreference: null, photos: [],
    });

    userRepo.save.mockResolvedValue({});
    profileRepo.create.mockReturnValue({ userId: 1, headline: 'SWE at Google', aboutMe: 'I am a software engineer passionate about building great products.' });
    profileRepo.save.mockResolvedValue({ userId: 1, headline: 'SWE at Google', aboutMe: 'About me', diet: Diet.VEGETARIAN });

    const profileResult = await profilesService.updateBasic(1, {
      headline: 'SWE at Google',
      aboutMe: 'I am a software engineer passionate about building great products.',
    } as any);

    expect(profileResult).toBeDefined();

    userRepo.findOne.mockResolvedValue({
      id: 2, uuid: user2Uuid, firstName: 'Bob', lastName: 'Jones', profile: { id: 2, userId: 2, gender: Gender.MALE, religion: 'hindu' }, status: UserStatus.ACTIVE,
    });

    interestRepo.findOne.mockResolvedValue(null);
    interestRepo.create.mockReturnValue({ id: 1, uuid: 'interest-uuid', fromUserId: 1, toUserId: 2, status: InterestStatus.SENT, message: 'Hi there!' });
    interestRepo.save.mockResolvedValue({ id: 1, uuid: 'interest-uuid', fromUserId: 1, toUserId: 2, status: InterestStatus.SENT });

    const interestResult = await interestsService.sendInterest(1, 2, { message: 'Hi there!' });

    expect(interestResult.status).toBe(InterestStatus.SENT);

    interestRepo.findOne
      .mockResolvedValueOnce({ id: 1, fromUserId: 1, toUserId: 2, status: InterestStatus.SENT })
      .mockResolvedValueOnce({ id: 2, fromUserId: 2, toUserId: 1, status: InterestStatus.ACCEPTED });

    interestRepo.save.mockResolvedValue({ id: 1, status: InterestStatus.ACCEPTED });
    matchRepo.create.mockReturnValue({});
    matchRepo.save.mockResolvedValue([]);

    const acceptResult = await interestsService.acceptInterest(1, 2);

    expect(acceptResult.status).toBe(InterestStatus.ACCEPTED);

    const convRepo = (chatService as any).conversationRepository;
    const partRepo = (chatService as any).participantRepository;
    const msgRepo = (chatService as any).messageRepository;
    const usrRepo = (chatService as any).userRepository;

    usrRepo.findOne
      .mockResolvedValueOnce({ id: 1, uuid: user1Uuid, firstName: 'Alice', lastName: 'Smith' })
      .mockResolvedValueOnce({ id: 2, uuid: user2Uuid, firstName: 'Bob', lastName: 'Jones' });

    partRepo.find.mockResolvedValue([]);
    convRepo.create.mockReturnValue({ id: 1, uuid: conversationUuid, type: 'direct', createdBy: 1, isActive: true, lastMessageAt: null });
    convRepo.save.mockResolvedValue({ id: 1, uuid: conversationUuid, type: 'direct', isActive: true });

    const chatResult = await chatService.createConversation(user1Uuid, user2Uuid, 'Hello Bob!');

    expect(chatResult.success).toBe(true);
    expect(chatResult.data.id).toBe(conversationUuid);
  });
});
