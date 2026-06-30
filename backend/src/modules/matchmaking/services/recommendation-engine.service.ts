import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { User } from '../../../database/entities/user.entity';
import { Profile } from '../../../database/entities/profile.entity';
import { DailyRecommendation } from '../../../database/entities/daily-recommendation.entity';
import { BlockedUser } from '../../../database/entities/blocked-user.entity';
import { Interest } from '../../../database/entities/interest.entity';
import { Match } from '../../../database/entities/match.entity';
import { PartnerPreference } from '../../../database/entities/partner-preference.entity';
import { InterestStatus } from '../../../common/enums';
import { CompatibilityService } from './compatibility.service';

@Processor('recommendation')
export class RecommendationEngineService extends WorkerHost {
  private readonly logger = new Logger(RecommendationEngineService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(DailyRecommendation)
    private readonly recommendationRepo: Repository<DailyRecommendation>,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepo: Repository<BlockedUser>,
    @InjectRepository(Interest)
    private readonly interestRepo: Repository<Interest>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(PartnerPreference)
    private readonly preferenceRepo: Repository<PartnerPreference>,
    private readonly compatibilityService: CompatibilityService,
  ) {
    super();
  }

  async process(job: Job<{ userId: number; limit?: number }>): Promise<any> {
    const { userId, limit = 20 } = job.data;
    this.logger.log(`Generating daily recommendations for user ${userId}`);

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: [
          'profile',
          'professionalDetail',
          'educationDetails',
          'lifestyleDetail',
          'horoscopeDetail',
          'partnerPreference',
        ],
      });

      if (!user || !user.profile) {
        this.logger.warn(`User ${userId} has no profile, skipping recommendations`);
        return { userId, recommendations: 0 };
      }

      const existingRecs = await this.recommendationRepo.find({
        where: { userId },
        select: ['recommendedUserId'],
      });
      const existingRecommendedIds = existingRecs.map((r) => r.recommendedUserId);

      const blockedByUser = await this.blockedUserRepo.find({
        where: { blockerId: userId },
        select: ['blockedId'],
      });
      const blockedByIds = blockedByUser.map((b) => b.blockedId);

      const blockedByOthers = await this.blockedUserRepo.find({
        where: { blockedId: userId },
        select: ['blockerId'],
      });
      const blockedByOtherIds = blockedByOthers.map((b) => b.blockerId);

      const excludeIds = new Set([
        userId,
        ...existingRecommendedIds,
        ...blockedByIds,
        ...blockedByOtherIds,
      ]);

      const sentInterests = await this.interestRepo.find({
        where: { fromUserId: userId, status: In([InterestStatus.SENT, InterestStatus.ACCEPTED]) },
        select: ['toUserId'],
      });
      sentInterests.forEach((i) => excludeIds.add(i.toUserId));

      const matches = await this.matchRepo.find({
        where: { userId, isActive: true },
        select: ['matchedUserId'],
      });
      matches.forEach((m) => excludeIds.add(m.matchedUserId));

      const reverseMatches = await this.matchRepo.find({
        where: { matchedUserId: userId, isActive: true },
        select: ['userId'],
      });
      reverseMatches.forEach((m) => excludeIds.add(m.userId));

      const preference = user.partnerPreference;
      const oppositeGender = user.profile.gender === 'male' ? 'female' : 'male';

      const queryBuilder = this.profileRepo
        .createQueryBuilder('profile')
        .innerJoinAndSelect('profile.user', 'user')
        .leftJoinAndSelect('user.professionalDetail', 'professionalDetail')
        .leftJoinAndSelect('user.educationDetails', 'educationDetails')
        .leftJoinAndSelect('user.lifestyleDetail', 'lifestyleDetail')
        .leftJoinAndSelect('user.horoscopeDetail', 'horoscopeDetail')
        .where('user.id NOT IN (:...excludeIds)', { excludeIds: [...excludeIds] })
        .andWhere('user.status = :status', { status: 'active' })
        .andWhere('profile.hideProfile = :hideProfile', { hideProfile: false });

      if (preference) {
        if (preference.ageMin) {
          queryBuilder.andWhere('profile.age >= :ageMin', { ageMin: preference.ageMin });
        }
        if (preference.ageMax) {
          queryBuilder.andWhere('profile.age <= :ageMax', { ageMax: preference.ageMax });
        }

        const religion = preference.religion as string[] | null;
        if (religion && religion.length > 0) {
          queryBuilder.andWhere('profile.religion IN (:...religion)', { religion });
        }

        const community = preference.community as string[] | null;
        if (community && community.length > 0) {
          queryBuilder.andWhere('profile.community IN (:...community)', { community });
        }

        const motherTongue = preference.motherTongue as string[] | null;
        if (motherTongue && motherTongue.length > 0) {
          queryBuilder.andWhere('profile.motherTongue IN (:...motherTongue)', { motherTongue });
        }

        const country = preference.country as string[] | null;
        if (country && country.length > 0) {
          queryBuilder.andWhere('profile.country IN (:...country)', { country });
        } else {
          queryBuilder.andWhere('profile.country = :defaultCountry', {
            defaultCountry: user.profile.country || 'India',
          });
        }
      } else {
        queryBuilder.andWhere('profile.gender = :gender', { gender: oppositeGender });
        if (user.profile.country) {
          queryBuilder.andWhere('profile.country = :country', { country: user.profile.country });
        }
      }

      const candidates = await queryBuilder
        .orderBy('user.lastActiveAt', 'DESC')
        .addOrderBy('profile.createdAt', 'DESC')
        .limit(limit * 3)
        .getMany();

      if (candidates.length === 0) {
        this.logger.log(`No candidates found for user ${userId}`);
        return { userId, recommendations: 0 };
      }

      const scoredCandidates: Array<{ recommendedUser: User; score: number; reason: string }> = [];

      for (const profile of candidates) {
        const candidateUser = profile.user;
        const result = this.compatibilityService.calculateScore(user, candidateUser);
        const reason = this.generateReason(result.score, candidateUser);
        scoredCandidates.push({
          recommendedUser: candidateUser,
          score: result.score,
          reason,
        });
      }

      scoredCandidates.sort((a, b) => b.score - a.score);
      const topCandidates = scoredCandidates.slice(0, limit);

      const recommendations = topCandidates.map((c) =>
        this.recommendationRepo.create({
          userId,
          recommendedUserId: c.recommendedUser.id,
          score: c.score,
          reason: c.reason,
        }),
      );

      if (recommendations.length > 0) {
        await this.recommendationRepo.save(recommendations);
      }

      this.logger.log(
        `Generated ${recommendations.length} recommendations for user ${userId}`,
      );

      return { userId, recommendations: recommendations.length };
    } catch (error) {
      this.logger.error(
        `Error generating recommendations for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private generateReason(score: number, recommendedUser: User): string {
    if (score >= 85) {
      return 'Excellent match based on overall compatibility';
    }
    if (score >= 70) {
      return 'Great match with strong compatibility in key areas';
    }
    if (score >= 50) {
      return 'Good match with several compatible areas';
    }

    const reasons: string[] = [];
    if (recommendedUser.profile?.city) {
      reasons.push(`Located in ${recommendedUser.profile.city}`);
    }
    if (recommendedUser.professionalDetail?.designation) {
      reasons.push(`Works as ${recommendedUser.professionalDetail.designation}`);
    }
    if (recommendedUser.educationDetails?.length) {
      const highest = recommendedUser.educationDetails.find((e) => e.isHighestDegree);
      if (highest?.degree) {
        reasons.push(`Educated in ${highest.degree}`);
      }
    }

    return reasons.length > 0
      ? reasons.join(' · ')
      : 'Suggested based on your preferences';
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Recommendation job ${job.id} completed for user ${job.data.userId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Recommendation job ${job.id} failed for user ${job.data.userId}: ${error.message}`,
    );
  }
}
