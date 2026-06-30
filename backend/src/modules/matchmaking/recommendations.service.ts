import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { DailyRecommendation } from '../../database/entities/daily-recommendation.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectRepository(DailyRecommendation)
    private readonly recommendationRepo: Repository<DailyRecommendation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateDailyRecommendations(userId: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.recommendationRepo.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(today),
      },
      take: 1,
    });

    if (existing.length > 0) {
      this.logger.log(`Recommendations already generated today for user ${userId}`);
      return;
    }

    // dev: recommendation queue disabled
  }

  async getDailyRecommendations(
    userId: number,
  ): Promise<{ data: DailyRecommendation[]; generated: boolean }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let recommendations = await this.recommendationRepo.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(today),
        isDismissed: false,
      },
      relations: [
        'recommendedUser',
        'recommendedUser.profile',
        'recommendedUser.professionalDetail',
        'recommendedUser.photos',
      ],
      order: { score: 'DESC' },
    });

    if (recommendations.length === 0) {
      await this.generateDailyRecommendations(userId);

      recommendations = await this.recommendationRepo.find({
        where: {
          userId,
          createdAt: MoreThanOrEqual(today),
          isDismissed: false,
        },
        relations: [
          'recommendedUser',
          'recommendedUser.profile',
          'recommendedUser.professionalDetail',
          'recommendedUser.photos',
        ],
        order: { score: 'DESC' },
      });

      return { data: recommendations, generated: true };
    }

    return { data: recommendations, generated: false };
  }

  async dismissRecommendation(userId: number, recId: number): Promise<void> {
    const rec = await this.recommendationRepo.findOne({
      where: { id: recId, userId },
    });

    if (!rec) {
      throw new NotFoundException('Recommendation not found');
    }

    rec.isDismissed = true;
    await this.recommendationRepo.save(rec);
  }
}
