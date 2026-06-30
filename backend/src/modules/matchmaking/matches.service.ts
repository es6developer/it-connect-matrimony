import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Match } from '../../database/entities/match.entity';
import { User } from '../../database/entities/user.entity';
import { CompatibilityService } from './services/compatibility.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly compatibilityService: CompatibilityService,
  ) {}

  async getMatches(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Match[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.matchRepo.findAndCount({
      where: { userId, isActive: true },
      relations: [
        'matchedUser',
        'matchedUser.profile',
        'matchedUser.professionalDetail',
      ],
      order: { matchedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async createMatch(user1Id: number, user2Id: number): Promise<Match> {
    const existing = await this.matchRepo.findOne({
      where: { userId: user1Id, matchedUserId: user2Id, isActive: true },
    });

    if (existing) {
      return existing;
    }

    const [user1, user2] = await Promise.all([
      this.userRepo.findOne({
        where: { id: user1Id },
        relations: [
          'profile',
          'professionalDetail',
          'educationDetails',
          'lifestyleDetail',
          'horoscopeDetail',
        ],
      }),
      this.userRepo.findOne({
        where: { id: user2Id },
        relations: [
          'profile',
          'professionalDetail',
          'educationDetails',
          'lifestyleDetail',
          'horoscopeDetail',
        ],
      }),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    const compatibility = this.compatibilityService.calculateScore(user1, user2);

    const match = this.matchRepo.create({
      uuid: uuidv4(),
      userId: user1Id,
      matchedUserId: user2Id,
      compatibilityScore: compatibility.score,
      aiScore: compatibility.score,
      isMutual: false,
      matchedAt: new Date(),
      isActive: true,
    });

    return this.matchRepo.save(match);
  }

  async getNewMatches(userId: number): Promise<Match[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.matchRepo.find({
      where: {
        userId,
        isActive: true,
        matchedAt: MoreThanOrEqual(today),
      },
      relations: [
        'matchedUser',
        'matchedUser.profile',
        'matchedUser.professionalDetail',
      ],
      order: { matchedAt: 'DESC' },
    });
  }

  async getMatchDetails(matchId: number, userId: number): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId, userId, isActive: true },
      relations: [
        'matchedUser',
        'matchedUser.profile',
        'matchedUser.professionalDetail',
        'matchedUser.educationDetails',
        'matchedUser.lifestyleDetail',
        'matchedUser.horoscopeDetail',
        'matchedUser.photos',
      ],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async unmatch(matchId: number, userId: number): Promise<void> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId, userId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    match.isActive = false;
    await this.matchRepo.save(match);

    const reverseMatch = await this.matchRepo.findOne({
      where: { userId: match.matchedUserId, matchedUserId: userId, isActive: true },
    });

    if (reverseMatch) {
      reverseMatch.isActive = false;
      await this.matchRepo.save(reverseMatch);
    }
  }

  async getSuggestions(
    userId: number,
    limit: number = 10,
  ): Promise<Array<{ user: User; score: number }>> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: [
        'profile',
        'professionalDetail',
        'educationDetails',
        'lifestyleDetail',
        'horoscopeDetail',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oppositeGender = user.profile?.gender === 'male' ? 'female' : 'male';

    const existingMatchIds = await this.matchRepo.find({
      where: { userId, isActive: true },
      select: ['matchedUserId'],
    });
    const excludeIds = new Set([userId, ...existingMatchIds.map((m) => m.matchedUserId)]);

    const candidates = await this.userRepo.find({
      where: {
        status: 'active' as any,
        profile: {
          hideProfile: false,
        },
      } as any,
      relations: [
        'profile',
        'professionalDetail',
        'educationDetails',
        'lifestyleDetail',
        'horoscopeDetail',
      ],
    });

    const filteredCandidates = candidates.filter(
      (c) => !excludeIds.has(c.id) && c.profile?.gender === oppositeGender,
    );

    const scored = filteredCandidates.map((candidate) => {
      const result = this.compatibilityService.calculateScore(user, candidate);
      return { user: candidate, score: result.score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  }
}
