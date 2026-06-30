import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from '../../database/entities/interest.entity';
import { Notification } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';
import { Match } from '../../database/entities/match.entity';
import { InterestStatus } from '../../common/enums';
import { SendInterestDto } from './dto/send-interest.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InterestsService {
  private readonly logger = new Logger(InterestsService.name);

  constructor(
    @InjectRepository(Interest)
    private readonly interestRepo: Repository<Interest>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
  ) {}

  async sendInterest(
    fromUserId: number,
    toUserId: number,
    dto: SendInterestDto,
  ): Promise<Interest> {
    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot send interest to yourself');
    }

    const toUser = await this.userRepo.findOne({ where: { id: toUserId } });
    if (!toUser) {
      throw new NotFoundException('User not found');
    }

    const existingInterest = await this.checkExistingInterest(fromUserId, toUserId);
    if (existingInterest) {
      throw new BadRequestException('Interest already sent to this user');
    }

    const interest = this.interestRepo.create({
      uuid: uuidv4(),
      fromUserId,
      toUserId,
      message: dto.message || null,
      status: InterestStatus.SENT,
    });

    const saved = await this.interestRepo.save(interest);

    await this.createNotification(
      toUserId,
      'interest_received',
      'New Interest Received',
      'Someone has shown interest in you. Check your interests to know more.',
      { interestId: saved.id, fromUserId },
    );

    return saved;
  }

  async acceptInterest(interestId: number, userId: number): Promise<Interest> {
    const interest = await this.interestRepo.findOne({
      where: { id: interestId },
      relations: ['fromUser', 'toUser'],
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    if (interest.toUserId !== userId) {
      throw new BadRequestException('This interest was not sent to you');
    }

    if (interest.status !== InterestStatus.SENT) {
      throw new BadRequestException(`Interest is already ${interest.status}`);
    }

    interest.status = InterestStatus.ACCEPTED;
    interest.actionedAt = new Date();

    const saved = await this.interestRepo.save(interest);

    const mutualInterest = await this.interestRepo.findOne({
      where: {
        fromUserId: interest.toUserId,
        toUserId: interest.fromUserId,
        status: InterestStatus.ACCEPTED,
      },
    });

    if (mutualInterest) {
      await this.createMatchRecords(interest.fromUserId, interest.toUserId);

      await this.createNotification(
        interest.fromUserId,
        'match_created',
        "It's a Match!",
        'You have a new match! Start a conversation now.',
        {
          matchUserId: interest.toUserId,
          interestId: saved.id,
        },
      );

      await this.createNotification(
        interest.toUserId,
        'match_created',
        "It's a Match!",
        'You have a new match! Start a conversation now.',
        {
          matchUserId: interest.fromUserId,
          interestId: saved.id,
        },
      );
    } else {
      await this.createNotification(
        interest.fromUserId,
        'interest_accepted',
        'Interest Accepted',
        'Your interest has been accepted!',
        { interestId: saved.id },
      );
    }

    return saved;
  }

  async rejectInterest(interestId: number, userId: number): Promise<Interest> {
    const interest = await this.interestRepo.findOne({ where: { id: interestId } });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    if (interest.toUserId !== userId) {
      throw new BadRequestException('This interest was not sent to you');
    }

    if (interest.status !== InterestStatus.SENT) {
      throw new BadRequestException(`Interest is already ${interest.status}`);
    }

    interest.status = InterestStatus.DECLINED;
    interest.actionedAt = new Date();

    const saved = await this.interestRepo.save(interest);

    await this.createNotification(
      interest.fromUserId,
      'interest_declined',
      'Interest Declined',
      'Your interest was declined.',
      { interestId: saved.id },
    );

    return saved;
  }

  async cancelInterest(interestId: number, userId: number): Promise<Interest> {
    const interest = await this.interestRepo.findOne({ where: { id: interestId } });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    if (interest.fromUserId !== userId) {
      throw new BadRequestException('You did not send this interest');
    }

    if (interest.status !== InterestStatus.SENT) {
      throw new BadRequestException(`Cannot cancel an already ${interest.status} interest`);
    }

    interest.status = InterestStatus.WITHDRAWN;

    return this.interestRepo.save(interest);
  }

  async getSentInterests(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Interest[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.interestRepo.findAndCount({
      where: { fromUserId: userId },
      relations: ['toUser', 'toUser.profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getReceivedInterests(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Interest[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.interestRepo.findAndCount({
      where: { toUserId: userId },
      relations: ['fromUser', 'fromUser.profile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getInterestDetails(interestId: number): Promise<Interest> {
    const interest = await this.interestRepo.findOne({
      where: { id: interestId },
      relations: [
        'fromUser',
        'fromUser.profile',
        'fromUser.professionalDetail',
        'toUser',
        'toUser.profile',
        'toUser.professionalDetail',
      ],
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    if (!interest.isRead) {
      interest.isRead = true;
      interest.readAt = new Date();
      await this.interestRepo.save(interest);
    }

    return interest;
  }

  async checkExistingInterest(
    fromUserId: number,
    toUserId: number,
  ): Promise<Interest | null> {
    return this.interestRepo.findOne({
      where: [
        { fromUserId, toUserId, status: InterestStatus.SENT },
        { fromUserId, toUserId, status: InterestStatus.ACCEPTED },
        { fromUserId: toUserId, toUserId: fromUserId, status: InterestStatus.SENT },
        { fromUserId: toUserId, toUserId: fromUserId, status: InterestStatus.ACCEPTED },
      ],
    });
  }

  private async createMatchRecords(user1Id: number, user2Id: number): Promise<void> {
    const match1 = this.matchRepo.create({
      uuid: uuidv4(),
      userId: user1Id,
      matchedUserId: user2Id,
      isMutual: true,
      matchedAt: new Date(),
      isActive: true,
    });

    const match2 = this.matchRepo.create({
      uuid: uuidv4(),
      userId: user2Id,
      matchedUserId: user1Id,
      isMutual: true,
      matchedAt: new Date(),
      isActive: true,
    });

    await this.matchRepo.save([match1, match2]);
  }

  private async createNotification(
    userId: number,
    type: string,
    title: string,
    body: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      const notification = this.notificationRepo.create({
        uuid: uuidv4(),
        userId,
        type,
        title,
        body,
        data,
        channel: 'push' as any,
      });
      await this.notificationRepo.save(notification);
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
    }
  }
}
