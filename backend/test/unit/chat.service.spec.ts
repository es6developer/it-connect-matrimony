import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';

import { ChatService } from '../../src/modules/chat/chat.service';
import { Conversation } from '../../src/database/entities/conversation.entity';
import { ConversationParticipant } from '../../src/database/entities/conversation-participant.entity';
import { Message } from '../../src/database/entities/message.entity';
import { Report } from '../../src/database/entities/report.entity';
import { User } from '../../src/database/entities/user.entity';

describe('ChatService', () => {
  let service: ChatService;
  let conversationRepository: any;
  let participantRepository: any;
  let messageRepository: any;
  let reportRepository: any;
  let userRepository: any;
  let configService: any;
  let messageQueue: any;

  const mockUser = { id: 1, uuid: 'user-uuid-1', firstName: 'John', lastName: 'Doe' };
  const mockOtherUser = { id: 2, uuid: 'user-uuid-2', firstName: 'Jane', lastName: 'Doe' };
  const mockConversation = {
    id: 1,
    uuid: 'conv-uuid-1',
    type: 'direct',
    isActive: true,
    createdBy: 1,
    lastMessageAt: null,
    createdAt: new Date(),
    title: null,
    participants: [
      { userId: 1, user: mockUser, leftAt: null, lastReadAt: null, isMuted: false },
      { userId: 2, user: mockOtherUser, leftAt: null, lastReadAt: null, isMuted: false },
    ],
  };

  beforeEach(async () => {
    conversationRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };
    participantRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
    };
    messageRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    reportRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findOne: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          'aws.region': 'us-east-1',
          'aws.accessKeyId': 'test-key',
          'aws.secretAccessKey': 'test-secret',
          'aws.s3Bucket': 'test-chat-bucket',
        };
        return config[key] ?? defaultValue;
      }),
    };
    messageQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getRepositoryToken(Conversation), useValue: conversationRepository },
        { provide: getRepositoryToken(ConversationParticipant), useValue: participantRepository },
        { provide: getRepositoryToken(Message), useValue: messageRepository },
        { provide: getRepositoryToken(Report), useValue: reportRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: ConfigService, useValue: configService },
        { provide: getQueueToken('chat:message'), useValue: messageQueue },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('createConversation', () => {
    it('should create a new direct conversation', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockOtherUser);
      participantRepository.find.mockResolvedValue([]);
      conversationRepository.create.mockReturnValue(mockConversation);
      conversationRepository.save.mockResolvedValue(mockConversation);
      participantRepository.create.mockReturnValue({});
      participantRepository.save.mockResolvedValue([]);

      const result = await service.createConversation('user-uuid-1', 'user-uuid-2');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw when creating conversation with self', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUser);

      await expect(
        service.createConversation('user-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if conversation already exists', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockOtherUser);
      participantRepository.find.mockResolvedValue([
        { userId: 1, leftAt: null, conversation: { ...mockConversation, participants: [{ userId: 2, leftAt: null }], isActive: true, type: 'direct' } },
      ]);

      await expect(
        service.createConversation('user-uuid-1', 'user-uuid-2'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('sendMessage', () => {
    it('should send a text message and update conversation', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      conversationRepository.findOne.mockResolvedValue(mockConversation);
      messageRepository.create.mockReturnValue({ id: 1, uuid: 'msg-uuid', content: 'Hello!', messageType: 'text', conversationId: 1, senderId: 1 });
      messageRepository.save.mockResolvedValue({ id: 1, uuid: 'msg-uuid', content: 'Hello!', messageType: 'text' });
      conversationRepository.save.mockResolvedValue(mockConversation);

      const result = await service.sendMessage('user-uuid-1', 'conv-uuid-1', 'Hello!', 'text');

      expect(result.success).toBe(true);
      expect(result.data.content).toBe('Hello!');
      expect(messageQueue.add).toHaveBeenCalledWith('process-message', expect.any(Object));
    });

    it('should throw when sender is not a participant', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      conversationRepository.findOne.mockResolvedValue({
        ...mockConversation,
        participants: [{ userId: 3, leftAt: null }],
      });

      await expect(
        service.sendMessage('user-uuid-1', 'conv-uuid-1', 'Hello', 'text'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      conversationRepository.findOne.mockResolvedValue(mockConversation);
      messageRepository.findAndCount.mockResolvedValue([
        [{ id: 1, uuid: 'msg-1', content: 'Hi', messageType: 'text', sender: mockUser, conversationId: 1, isRead: false, createdAt: new Date() }],
        1,
      ]);
      const mockQB = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };
      messageRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getMessages('conv-uuid-1', 'user-uuid-1', { page: 1, limit: 20 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark messages as read for the other participant', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      conversationRepository.findOne.mockResolvedValue(mockConversation);
      participantRepository.save.mockResolvedValue({ userId: 1, lastReadAt: new Date() });
      const mockQB = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      messageRepository.createQueryBuilder.mockReturnValue(mockQB);

      await service.markAsRead('conv-uuid-1', 'user-uuid-1');

      expect(mockQB.execute).toHaveBeenCalled();
    });
  });

  describe('deleteConversation', () => {
    it('should soft-delete a conversation for the user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      conversationRepository.findOne.mockResolvedValue(mockConversation);
      participantRepository.save.mockResolvedValue({ userId: 1, leftAt: new Date() });

      const result = await service.deleteConversation('conv-uuid-1', 'user-uuid-1');

      expect(result.success).toBe(true);
      expect(participantRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ leftAt: expect.any(Date) }),
      );
    });
  });

  describe('reportMessage', () => {
    it('should create a report for a message', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      const mockMessage = {
        id: 1,
        uuid: 'msg-uuid',
        content: 'Inappropriate content',
        senderId: 2,
        sender: mockOtherUser,
        conversation: mockConversation,
      };
      messageRepository.findOne.mockResolvedValue(mockMessage);
      reportRepository.create.mockReturnValue({ id: 1, uuid: 'report-uuid' });
      reportRepository.save.mockResolvedValue({ id: 1, uuid: 'report-uuid' });

      const result = await service.reportMessage('user-uuid-1', 'msg-uuid', 'Harassment');

      expect(result.success).toBe(true);
      expect(result.data.reportId).toBe('report-uuid');
    });
  });
});
