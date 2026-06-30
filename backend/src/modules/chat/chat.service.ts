import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Conversation } from '../../database/entities/conversation.entity';
import { ConversationParticipant } from '../../database/entities/conversation-participant.entity';
import { Message } from '../../database/entities/message.entity';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { ERROR_CODES } from '../../common/constants';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UploadedFileResponse } from '../../common/interfaces';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly s3Client: S3Client;

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const region = this.configService.get<string>('aws.region', 'us-east-1');
    const accessKeyId = this.configService.get<string>('aws.accessKeyId', '');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey', '');
    this.s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async getConversations(userId: string, pagination: PaginationDto) {
    const user = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [participants, total] = await this.participantRepository.findAndCount({
      where: { userId: user.id, leftAt: IsNull() },
      relations: [
        'conversation',
        'conversation.participants',
        'conversation.participants.user',
      ],
      order: { conversation: { lastMessageAt: 'DESC' } },
      skip: (page - 1) * limit,
      take: limit,
    });

    const conversations = await Promise.all(
      participants.map(async (p) => {
        const conv = p.conversation;
        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conv.id, isDeletedForAll: false },
          order: { createdAt: 'DESC' },
          relations: ['sender'],
        });

        const otherIds = conv.participants
          .filter((cp) => cp.userId !== user.id)
          .map((cp) => cp.userId);

        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conv.id,
            senderId: In(otherIds),
            isRead: false,
          },
        });

        return {
          id: conv.uuid,
          type: conv.type,
          title: conv.title,
          lastMessage: lastMessage
            ? {
                id: lastMessage.uuid,
                content: lastMessage.content,
                messageType: lastMessage.messageType,
                mediaUrl: lastMessage.mediaUrl,
                senderId: lastMessage.sender?.uuid || null,
                createdAt: lastMessage.createdAt,
              }
            : null,
          otherParticipants: otherIds.map((id) => {
            const cp = conv.participants.find((p) => p.userId === id);
            return {
              id: cp?.user?.uuid ?? null,
              firstName: cp?.user?.firstName ?? '',
              lastName: cp?.user?.lastName ?? '',
            };
          }),
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
        };
      }),
    );

    return {
      success: true,
      message: 'Conversations fetched successfully',
      data: conversations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async createConversation(currentUserId: string, otherUserId: string, initialMessage?: string) {
    const currentUser = await this.userRepository.findOne({ where: { uuid: currentUserId } });
    const otherUser = await this.userRepository.findOne({ where: { uuid: otherUserId } });

    if (!currentUser || !otherUser) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    if (currentUser.id === otherUser.id) {
      throw new BadRequestException({ success: false, message: 'Cannot start conversation with yourself', statusCode: 400 });
    }

    const allConversations = await this.participantRepository.find({
      where: { userId: currentUser.id, leftAt: IsNull() },
      relations: ['conversation', 'conversation.participants'],
    });

    for (const participant of allConversations) {
      const conv = participant.conversation;
      const hasOther = conv.participants.some(
        (cp) => cp.userId === otherUser.id && cp.leftAt === null,
      );
      if (hasOther && conv.type === 'direct' && conv.isActive) {
        throw new ConflictException({ success: false, message: 'Conversation already exists', statusCode: 409 });
      }
    }

    const conversationUuid = uuidv4();
    const conversation = this.conversationRepository.create({
      uuid: conversationUuid,
      type: 'direct',
      createdBy: currentUser.id,
      isActive: true,
      lastMessageAt: initialMessage ? new Date() : null,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    const participants = [
      this.participantRepository.create({
        conversationId: savedConversation.id,
        userId: currentUser.id,
        joinedAt: new Date(),
      }),
      this.participantRepository.create({
        conversationId: savedConversation.id,
        userId: otherUser.id,
        joinedAt: new Date(),
      }),
    ];

    await this.participantRepository.save(participants);

    let savedMessage: Message | null = null;
    if (initialMessage) {
      const message = this.messageRepository.create({
        uuid: uuidv4(),
        conversationId: savedConversation.id,
        senderId: currentUser.id,
        content: initialMessage,
        messageType: 'text',
      });
      savedMessage = await this.messageRepository.save(message);
    }

    return {
      success: true,
      message: 'Conversation created successfully',
      data: {
        id: savedConversation.uuid,
        type: savedConversation.type,
        participants: [
          { id: currentUser.uuid, firstName: currentUser.firstName, lastName: currentUser.lastName },
          { id: otherUser.uuid, firstName: otherUser.firstName, lastName: otherUser.lastName },
        ],
        initialMessage: savedMessage
          ? { id: savedMessage.uuid, content: savedMessage.content, createdAt: savedMessage.createdAt }
          : null,
        createdAt: savedConversation.createdAt,
      },
    };
  }

  async getConversation(conversationId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationId, isActive: true },
      relations: ['participants', 'participants.user'],
    });

    if (!conversation) {
      throw new NotFoundException({ success: false, message: 'Conversation not found', error: ERROR_CODES.NOT_FOUND, statusCode: 404 });
    }

    const isParticipant = conversation.participants.some(
      (cp) => cp.userId === user.id && cp.leftAt === null,
    );
    if (!isParticipant) {
      throw new ForbiddenException({ success: false, message: 'You are not a participant of this conversation', statusCode: 403 });
    }

    return {
      success: true,
      message: 'Conversation fetched successfully',
      data: {
        id: conversation.uuid,
        type: conversation.type,
        title: conversation.title,
        participants: conversation.participants
          .filter((cp) => cp.leftAt === null)
          .map((cp) => ({
            id: cp.user.uuid,
            firstName: cp.user.firstName,
            lastName: cp.user.lastName,
            isMuted: cp.isMuted,
            lastReadAt: cp.lastReadAt,
          })),
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
      },
    };
  }

  async getMessages(conversationId: string, userId: string, pagination: PaginationDto) {
    const user = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationId, isActive: true },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException({ success: false, message: 'Conversation not found', error: ERROR_CODES.NOT_FOUND, statusCode: 404 });
    }

    const isParticipant = conversation.participants.some(
      (cp) => cp.userId === user.id && cp.leftAt === null,
    );
    if (!isParticipant) {
      throw new ForbiddenException({ success: false, message: 'You are not a participant of this conversation', statusCode: 403 });
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId: conversation.id, isDeletedForAll: false },
      relations: ['sender'],
      order: { createdAt: pagination.sortOrder ?? 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    await this.markAsRead(conversationId, userId);

    return {
      success: true,
      message: 'Messages fetched successfully',
      data: messages.map((msg) => ({
        id: msg.uuid,
        conversationId: conversation.uuid,
        senderId: msg.sender.uuid,
        content: msg.content,
        messageType: msg.messageType,
        mediaUrl: msg.mediaUrl,
        thumbnailUrl: msg.thumbnailUrl,
        fileSize: msg.fileSize,
        duration: msg.duration,
        isRead: msg.isRead,
        readAt: msg.readAt,
        isDelivered: msg.isDelivered,
        createdAt: msg.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async sendMessage(senderId: string, conversationId: string, content: string, type: string, mediaUrl?: string) {
    const sender = await this.userRepository.findOne({ where: { uuid: senderId } });
    if (!sender) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationId, isActive: true },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException({ success: false, message: 'Conversation not found', error: ERROR_CODES.NOT_FOUND, statusCode: 404 });
    }

    const isParticipant = conversation.participants.some(
      (cp) => cp.userId === sender.id && cp.leftAt === null,
    );
    if (!isParticipant) {
      throw new ForbiddenException({ success: false, message: 'You are not a participant of this conversation', statusCode: 403 });
    }

    const message = this.messageRepository.create({
      uuid: uuidv4(),
      conversationId: conversation.id,
      senderId: sender.id,
      content: type === 'text' ? content : null,
      messageType: type,
      mediaUrl: mediaUrl || null,
    });

    const savedMessage = await this.messageRepository.save(message);

    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);

    // dev: messageQueue processing disabled

    return {
      success: true,
      message: 'Message sent successfully',
      data: {
        id: savedMessage.uuid,
        conversationId: conversation.uuid,
        senderId: sender.uuid,
        content: savedMessage.content,
        messageType: savedMessage.messageType,
        mediaUrl: savedMessage.mediaUrl,
        createdAt: savedMessage.createdAt,
      },
    };
  }

  async markAsRead(conversationId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!user) return;

    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationId, isActive: true },
      relations: ['participants'],
    });

    if (!conversation) return;

    const participant = conversation.participants.find(
      (cp) => cp.userId === user.id && cp.leftAt === null,
    );
    if (!participant) return;

    participant.lastReadAt = new Date();
    await this.participantRepository.save(participant);

    const otherUserIds = conversation.participants
      .filter((cp) => cp.userId !== user.id)
      .map((cp) => cp.userId);

    if (otherUserIds.length > 0) {
      await this.messageRepository
        .createQueryBuilder()
        .update(Message)
        .set({ isRead: true, readAt: new Date() })
        .where('conversationId = :convId', { convId: conversation.id })
        .andWhere('senderId IN (:...senderIds)', { senderIds: otherUserIds })
        .andWhere('isRead = :isRead', { isRead: false })
        .execute();
    }
  }

  async deleteConversation(conversationId: string, userId: string) {
    const user = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const conversation = await this.conversationRepository.findOne({
      where: { uuid: conversationId },
      relations: ['participants'],
    });

    if (!conversation) {
      throw new NotFoundException({ success: false, message: 'Conversation not found', error: ERROR_CODES.NOT_FOUND, statusCode: 404 });
    }

    const participant = conversation.participants.find(
      (cp) => cp.userId === user.id && cp.leftAt === null,
    );
    if (!participant) {
      throw new ForbiddenException({ success: false, message: 'You are not a participant of this conversation', statusCode: 403 });
    }

    participant.leftAt = new Date();
    await this.participantRepository.save(participant);

    const hasActiveParticipants = conversation.participants.some(
      (cp) => cp.userId !== user.id && cp.leftAt === null,
    );

    if (!hasActiveParticipants) {
      conversation.isActive = false;
      await this.conversationRepository.save(conversation);
    }

    return {
      success: true,
      message: 'Conversation deleted successfully',
    };
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<UploadedFileResponse> {
    const user = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const bucket = this.configService.get<string>('aws.s3Bucket', 'it-connect-matrimony-chat');
    const key = `chat/${userId}/${uuidv4()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      const region = this.configService.get<string>('aws.region', 'us-east-1');
      const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      return {
        key,
        url,
        size: file.size,
        mimetype: file.mimetype,
        originalName: file.originalname,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to S3', error);
      throw new BadRequestException({
        success: false,
        message: 'Failed to upload file',
        error: ERROR_CODES.UPLOAD_FAILED,
        statusCode: 400,
      });
    }
  }

  async reportMessage(userId: string, messageId: string, reason: string) {
    const reporter = await this.userRepository.findOne({ where: { uuid: userId } });
    if (!reporter) {
      throw new NotFoundException({ success: false, message: 'User not found', error: ERROR_CODES.USER_NOT_FOUND, statusCode: 404 });
    }

    const message = await this.messageRepository.findOne({
      where: { uuid: messageId },
      relations: ['sender', 'conversation', 'conversation.participants'],
    });

    if (!message) {
      throw new NotFoundException({ success: false, message: 'Message not found', error: ERROR_CODES.NOT_FOUND, statusCode: 404 });
    }

    const isParticipant = message.conversation.participants.some(
      (cp) => cp.userId === reporter.id,
    );
    if (!isParticipant) {
      throw new ForbiddenException({ success: false, message: 'You are not a participant of this conversation', statusCode: 403 });
    }

    const report = this.reportRepository.create({
      uuid: uuidv4(),
      reporterId: reporter.id,
      reportedUserId: message.senderId,
      reason,
      description: `Reported message: ${message.content || '[media message]'}`,
      evidenceUrls: { messageUuid: message.uuid },
    });

    await this.reportRepository.save(report);

    return {
      success: true,
      message: 'Message reported successfully',
      data: { reportId: report.uuid },
    };
  }
}
