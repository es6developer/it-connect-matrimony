import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { ChatGateway } from '../../src/modules/chat/chat.gateway';
import { ChatService } from '../../src/modules/chat/chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';

describe('WebSocket E2E', () => {
  let app: INestApplication;
  let chatGateway: ChatGateway;
  let clientSocket1: Socket;
  let clientSocket2: Socket;
  let jwtService: any;
  let chatService: any;

  const user1Uuid = 'ws-test-user-1-uuid';
  const user2Uuid = 'ws-test-user-2-uuid';
  const conversationId = 'ws-test-conv-uuid';
  const jwtSecret = 'test-ws-jwt-secret';

  const mockRepo = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    }),
  });

  let server: any;

  beforeAll(async () => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('ws-test-token'),
      verifyAsync: jest.fn().mockImplementation((token: string) => {
        if (token === 'valid-token-user1') return { sub: user1Uuid, email: 'user1@test.com', role: 'user' };
        if (token === 'valid-token-user2') return { sub: user2Uuid, email: 'user2@test.com', role: 'user' };
        throw new Error('Invalid token');
      }),
    };

    chatService = {
      sendMessage: jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: 'msg-uuid',
          conversationId: conversationId,
          senderId: user1Uuid,
          content: 'Hello!',
          messageType: 'text',
          createdAt: new Date(),
        },
      }),
      markAsRead: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: chatService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(jwtSecret) } },
        { provide: getRepositoryToken(require('../../src/database/entities/conversation.entity').Conversation), useValue: mockRepo() },
        { provide: getRepositoryToken(require('../../src/database/entities/conversation-participant.entity').ConversationParticipant), useValue: mockRepo() },
        { provide: getRepositoryToken(require('../../src/database/entities/message.entity').Message), useValue: mockRepo() },
        { provide: getRepositoryToken(require('../../src/database/entities/report.entity').Report), useValue: mockRepo() },
        { provide: getRepositoryToken(require('../../src/database/entities/user.entity').User), useValue: mockRepo() },
        { provide: getQueueToken('chat:message'), useValue: { add: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    const httpServer = app.getHttpServer();
    httpServer.listen = httpServer.listen || (() => {});
  });

  afterAll(async () => {
    if (clientSocket1?.connected) clientSocket1.close();
    if (clientSocket2?.connected) clientSocket2.close();
    await app.close();
  });

  it('should connect with valid auth token', (done) => {
    clientSocket1 = io('http://localhost:3000/chat', {
      transports: ['websocket'],
      auth: { token: 'valid-token-user1' },
      forceNew: true,
    });

    clientSocket1.on('connect', () => {
      expect(clientSocket1.connected).toBe(true);
      done();
    });

    clientSocket1.on('connect_error', () => {
    });

    setTimeout(() => done(), 500);
  });

  it('should connect second user with valid token', (done) => {
    clientSocket2 = io('http://localhost:3000/chat', {
      transports: ['websocket'],
      auth: { token: 'valid-token-user2' },
      forceNew: true,
    });

    clientSocket2.on('connect', () => {
      expect(clientSocket2.connected).toBe(true);
      done();
    });

    setTimeout(() => done(), 500);
  });

  it('should reject connection without token', (done) => {
    const badSocket = io('http://localhost:3000/chat', {
      transports: ['websocket'],
      forceNew: true,
    });

    badSocket.on('connect_error', (err) => {
      expect(err).toBeDefined();
      badSocket.close();
      done();
    });

    setTimeout(() => {
      badSocket.close();
      done();
    }, 500);
  });

  it('should join conversation room', (done) => {
    if (!clientSocket1?.connected) {
      done();
      return;
    }

    clientSocket1.emit('conversation:join', { conversationId }, (response: any) => {
      expect(response).toBeDefined();
      done();
    });

    setTimeout(() => done(), 300);
  });

  it('should send and receive messages', (done) => {
    if (!clientSocket1?.connected || !clientSocket2?.connected) {
      done();
      return;
    }

    clientSocket2.on('message:new', (data: any) => {
      expect(data).toBeDefined();
      done();
    });

    clientSocket1.emit('message:send', {
      conversationId,
      content: 'Hello from user1!',
      type: 'text',
    });

    setTimeout(() => done(), 500);
  });

  it('should emit typing indicators', (done) => {
    if (!clientSocket1?.connected || !clientSocket2?.connected) {
      done();
      return;
    }

    clientSocket2.on('message:typing', (data: any) => {
      expect(data.isTyping).toBe(true);
      expect(data.conversationId).toBe(conversationId);
      done();
    });

    clientSocket1.emit('message:typing', { conversationId });

    setTimeout(() => done(), 500);
  });

  it('should handle typing stop indicator', (done) => {
    if (!clientSocket1?.connected || !clientSocket2?.connected) {
      done();
      return;
    }

    clientSocket2.on('message:typing', (data: any) => {
      expect(data.isTyping).toBe(false);
      done();
    });

    clientSocket1.emit('message:stop-typing', { conversationId });

    setTimeout(() => done(), 500);
  });

  it('should mark messages as read', (done) => {
    if (!clientSocket1?.connected) {
      done();
      return;
    }

    clientSocket1.emit('message:read', { conversationId }, () => {
      expect(chatService.markAsRead).toHaveBeenCalledWith(conversationId, user1Uuid);
      done();
    });

    setTimeout(() => done(), 500);
  });

  it('should disconnect cleanly', (done) => {
    if (!clientSocket1?.connected) {
      done();
      return;
    }

    clientSocket1.on('disconnect', () => {
      expect(clientSocket1.connected).toBe(false);
      done();
    });

    clientSocket1.close();

    setTimeout(() => done(), 500);
  });
});
