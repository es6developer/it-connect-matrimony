import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ChatService } from './chat.service';
import { Conversation } from '../../database/entities/conversation.entity';
import { ConversationParticipant } from '../../database/entities/conversation-participant.entity';
import { Message } from '../../database/entities/message.entity';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';

describe('ChatService', () => {
  let service: ChatService;
  let userRepository: Repository<User>;
  let conversationRepository: Repository<Conversation>;
  let participantRepository: Repository<ConversationParticipant>;
  let messageRepository: Repository<Message>;
  let reportRepository: Repository<Report>;

  const mockUser = {
    id: 1,
    uuid: 'user-uuid-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  } as User;

  const mockOtherUser = {
    id: 2,
    uuid: 'user-uuid-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
  } as User;

  const mockConversation = {
    id: 1,
    uuid: 'conv-uuid-1',
    type: 'direct',
    createdBy: 1,
    isActive: true,
    lastMessageAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: null,
    participants: [],
  } as unknown as Conversation;

  const mockParticipant = {
    id: 1,
    conversationId: 1,
    userId: 1,
    lastReadAt: null,
    isMuted: false,
    isBlocked: false,
    joinedAt: new Date(),
    leftAt: null,
  } as ConversationParticipant;

  const mockMessage = {
    id: 1,
    uuid: 'msg-uuid-1',
    conversationId: 1,
    senderId: 1,
    content: 'Hello!',
    messageType: 'text',
    mediaUrl: null,
    isRead: false,
    isDeletedForAll: false,
    createdAt: new Date(),
    sender: mockUser,
  } as Message;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockParticipant], 1]),
    getOne: jest.fn().mockResolvedValue(mockParticipant),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(ConversationParticipant),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Message),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Report),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                'aws.region': 'us-east-1',
                'aws.accessKeyId': 'test-key',
                'aws.secretAccessKey': 'test-secret',
                'aws.s3Bucket': 'test-bucket',
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: getQueueToken('chat:message'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    conversationRepository = module.get<Repository<Conversation>>(getRepositoryToken(Conversation));
    participantRepository = module.get<Repository<ConversationParticipant>>(getRepositoryToken(ConversationParticipant));
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    reportRepository = module.get<Repository<Report>>(getRepositoryToken(Report));
  });

  describe('getConversations', () => {
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getConversations('nonexistent', { page: 1, limit: 20, skip: 0, sortBy: 'createdAt', sortOrder: 'DESC' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return conversations for the user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(participantRepository, 'findAndCount').mockResolvedValue([[{
        ...mockParticipant,
        conversation: { ...mockConversation, participants: [mockParticipant, { ...mockParticipant, userId: 2 }] },
      }], 1]);
      jest.spyOn(messageRepository, 'findOne').mockResolvedValue(mockMessage);
      jest.spyOn(messageRepository, 'count').mockResolvedValue(0);

      const result = await service.getConversations('user-uuid-1', { page: 1, limit: 20, skip: 0, sortBy: 'createdAt', sortOrder: 'DESC' });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('conv-uuid-1');
    });
  });

  describe('createConversation', () => {
    it('should throw NotFoundException if current user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.createConversation('nonexistent', 'user-uuid-2'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if other user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);

      await expect(
        service.createConversation('user-uuid-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if creating conversation with self', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(
        service.createConversation('user-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a conversation successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(mockUser).mockResolvedValueOnce(mockOtherUser);
      jest.spyOn(participantRepository, 'find').mockResolvedValue([]);
      jest.spyOn(conversationRepository, 'create').mockReturnValue(mockConversation);
      jest.spyOn(conversationRepository, 'save').mockResolvedValue(mockConversation);
      jest.spyOn(participantRepository, 'create').mockReturnValue(mockParticipant);
      jest.spyOn(participantRepository, 'save').mockResolvedValue([mockParticipant] as any);

      const result = await service.createConversation('user-uuid-1', 'user-uuid-2', 'Hi!');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Conversation created successfully');
    });
  });

  describe('getConversation', () => {
    it('should throw NotFoundException if conversation not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(conversationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.getConversation('nonexistent', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a participant', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(conversationRepository, 'findOne').mockResolvedValue({
        ...mockConversation,
        participants: [{ ...mockParticipant, userId: 3 }],
      });

      await expect(
        service.getConversation('conv-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return conversation details', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(conversationRepository, 'findOne').mockResolvedValue({
        ...mockConversation,
        participants: [
          { ...mockParticipant, user: mockUser },
          { ...mockParticipant, userId: 2, user: mockOtherUser },
        ],
      });

      const result = await service.getConversation('conv-uuid-1', 'user-uuid-1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('conv-uuid-1');
      expect(result.data.participants).toHaveLength(2);
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(conversationRepository, 'findOne').mockResolvedValue({
        ...mockConversation,
        participants: [{ ...mockParticipant, user: mockUser }],
      });
      jest.spyOn(messageRepository, 'findAndCount').mockResolvedValue([[mockMessage], 1]);
      jest.spyOn(participantRepository, 'findOne').mockResolvedValue(mockParticipant);
      jest.spyOn(messageRepository, 'update').mockResolvedValue({ affected: 1 } as any);

      const result = await service.getMessages('conv-uuid-1', 'user-uuid-1', {
        page: 1, limit: 20, skip: 0, sortBy: 'createdAt', sortOrder: 'DESC',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('msg-uuid-1');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(conversationRepository, 'findOne').mockResolvedValue({
        ...mockConversation,
        participants: [{ ...mockParticipant, user: mockUser }],
      });
      jest.spyOn(messageRepository, 'create').mockReturnValue(mockMessage);
      jest.spyOn(messageRepository, 'save').mockResolvedValue(mockMessage);
      jest.spyOn(conversationRepository, 'save').mockResolvedValue(mockConversation);

      const result = await service.sendMessage('user-uuid-1', 'conv-uuid-1', 'Hello!', 'text');

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('Hello!');
    });
  });

  describe('deleteConversation', () => {
    it('should soft delete conversation', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(conversationRepository, 'findOne').mockResolvedValue({
        ...mockConversation,
        participants: [{ ...mockParticipant, user: mockUser }],
      });
      jest.spyOn(participantRepository, 'save').mockResolvedValue(mockParticipant);

      const result = await service.deleteConversation('conv-uuid-1', 'user-uuid-1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Conversation deleted successfully');
    });
  });

  describe('reportMessage', () => {
    it('should report a message successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(messageRepository, 'findOne').mockResolvedValue({
        ...mockMessage,
        conversation: { ...mockConversation, participants: [{ ...mockParticipant, user: mockUser }] },
      });
      jest.spyOn(reportRepository, 'create').mockReturnValue({ uuid: 'report-uuid-1' } as Report);
      jest.spyOn(reportRepository, 'save').mockResolvedValue({ uuid: 'report-uuid-1' } as Report);

      const result = await service.reportMessage('user-uuid-1', 'msg-uuid-1', 'Inappropriate content');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Message reported successfully');
    });
  });
});
