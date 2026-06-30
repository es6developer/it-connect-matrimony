import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { SavedSearch } from '../../database/entities/saved-search.entity';
import { SearchHistory } from '../../database/entities/search-history.entity';
import { BlockedUser } from '../../database/entities/blocked-user.entity';
import { Interest } from '../../database/entities/interest.entity';
import { Match } from '../../database/entities/match.entity';
import { InterestStatus, Gender } from '../../common/enums';
import { SearchProfilesDto } from './dto/search-profiles.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(SavedSearch)
    private readonly savedSearchRepo: Repository<SavedSearch>,
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepo: Repository<SearchHistory>,
    @InjectRepository(BlockedUser)
    private readonly blockedUserRepo: Repository<BlockedUser>,
    @InjectRepository(Interest)
    private readonly interestRepo: Repository<Interest>,
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
  ) {}

  async searchProfiles(
    userId: number,
    filters: SearchProfilesDto,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20 } = filters;

    const currentUser = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

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

    const excludeIds = new Set<number>([userId, ...blockedByIds, ...blockedByOtherIds]);

    if (filters.excludeInterested) {
      const sentInterests = await this.interestRepo.find({
        where: [
          { fromUserId: userId, status: InterestStatus.SENT },
          { fromUserId: userId, status: InterestStatus.ACCEPTED },
        ],
        select: ['toUserId'],
      });
      sentInterests.forEach((i) => excludeIds.add(i.toUserId));

      const receivedInterests = await this.interestRepo.find({
        where: [
          { toUserId: userId, status: InterestStatus.SENT },
          { toUserId: userId, status: InterestStatus.ACCEPTED },
        ],
        select: ['fromUserId'],
      });
      receivedInterests.forEach((i) => excludeIds.add(i.fromUserId));
    }

    if (filters.excludeMatched) {
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
    }

    const queryBuilder = this.profileRepo
      .createQueryBuilder('profile')
      .innerJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('user.professionalDetail', 'professionalDetail')
      .leftJoinAndSelect('user.educationDetails', 'educationDetails')
      .leftJoinAndSelect('user.photos', 'photos')
      .where('user.id NOT IN (:...excludeIds)', { excludeIds: [...excludeIds] })
      .andWhere('user.status = :status', { status: 'active' })
      .andWhere('profile.hideProfile = :hideProfile', { hideProfile: false });

    const targetGender = filters.gender || (
      currentUser.profile?.gender === Gender.MALE ? Gender.FEMALE : Gender.MALE
    );
    queryBuilder.andWhere('profile.gender = :gender', { gender: targetGender });

    if (filters.ageMin) {
      queryBuilder.andWhere('profile.age >= :ageMin', { ageMin: filters.ageMin });
    }
    if (filters.ageMax) {
      queryBuilder.andWhere('profile.age <= :ageMax', { ageMax: filters.ageMax });
    }

    if (filters.country) {
      queryBuilder.andWhere('profile.country = :country', { country: filters.country });
    }
    if (filters.state) {
      queryBuilder.andWhere('profile.state = :state', { state: filters.state });
    }
    if (filters.city) {
      queryBuilder.andWhere('profile.city = :city', { city: filters.city });
    }

    if (filters.religion) {
      queryBuilder.andWhere('profile.religion = :religion', { religion: filters.religion });
    }
    if (filters.community) {
      queryBuilder.andWhere('profile.community = :community', { community: filters.community });
    }
    if (filters.motherTongue) {
      queryBuilder.andWhere('profile.motherTongue = :motherTongue', { motherTongue: filters.motherTongue });
    }

    if (filters.maritalStatus) {
      queryBuilder.andWhere('profile.maritalStatus = :maritalStatus', { maritalStatus: filters.maritalStatus });
    }

    if (filters.technologyStack) {
      const techValues = filters.technologyStack.split(',').map((t) => t.trim());
      const conditions = techValues.map(
        (_, i) => `JSON_CONTAINS(professionalDetail.technologyStack, :tech${i})`,
      );
      const params = techValues.reduce(
        (acc, val, i) => ({ ...acc, [`tech${i}`]: JSON.stringify(val) }),
        {},
      );
      queryBuilder.andWhere(
        `(${conditions.join(' OR ')})`,
        params,
      );
    }

    if (filters.companyName) {
      queryBuilder.andWhere(
        'professionalDetail.currentCompany LIKE :companyName',
        { companyName: `%${filters.companyName}%` },
      );
    }

    if (filters.designation) {
      queryBuilder.andWhere(
        'professionalDetail.designation LIKE :designation',
        { designation: `%${filters.designation}%` },
      );
    }

    if (filters.experienceMin !== undefined) {
      queryBuilder.andWhere(
        'professionalDetail.yearsOfExperience >= :expMin',
        { expMin: filters.experienceMin },
      );
    }
    if (filters.experienceMax !== undefined) {
      queryBuilder.andWhere(
        'professionalDetail.yearsOfExperience <= :expMax',
        { expMax: filters.experienceMax },
      );
    }

    if (filters.salaryMin !== undefined) {
      queryBuilder.andWhere(
        'professionalDetail.currentSalary >= :salMin',
        { salMin: filters.salaryMin },
      );
    }
    if (filters.salaryMax !== undefined) {
      queryBuilder.andWhere(
        'professionalDetail.currentSalary <= :salMax',
        { salMax: filters.salaryMax },
      );
    }

    if (filters.workMode) {
      queryBuilder.andWhere(
        'professionalDetail.workMode = :workMode',
        { workMode: filters.workMode },
      );
    }

    if (filters.educationLevel) {
      queryBuilder.andWhere(
        'educationDetails.degree LIKE :educationLevel',
        { educationLevel: `%${filters.educationLevel}%` },
      );
    }

    if (filters.hasPhotos) {
      queryBuilder.andWhere('photos.id IS NOT NULL');
    }

    if (filters.onlineNow) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      queryBuilder.andWhere('user.lastActiveAt >= :onlineSince', {
        onlineSince: fiveMinutesAgo,
      });
    }

    queryBuilder
      .orderBy('user.lastActiveAt', 'DESC')
      .addOrderBy('profile.createdAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [profiles, total] = await queryBuilder.getManyAndCount();

    const users = profiles.map((p) => p.user);

    await this.saveSearchHistory(userId, filters, total);

    return { data: users, total, page, limit };
  }

  async saveSearch(
    userId: number,
    name: string,
    filters: Record<string, any>,
  ): Promise<SavedSearch> {
    const savedSearch = this.savedSearchRepo.create({
      userId,
      name,
      filters,
    });
    return this.savedSearchRepo.save(savedSearch);
  }

  async getSavedSearches(userId: number): Promise<SavedSearch[]> {
    return this.savedSearchRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteSavedSearch(id: number, userId: number): Promise<void> {
    const savedSearch = await this.savedSearchRepo.findOne({
      where: { id, userId },
    });
    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }
    await this.savedSearchRepo.remove(savedSearch);
  }

  async getSearchHistory(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: SearchHistory[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.searchHistoryRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async clearSearchHistory(userId: number): Promise<void> {
    await this.searchHistoryRepo.delete({ userId });
  }

  private async saveSearchHistory(
    userId: number,
    filters: SearchProfilesDto,
    resultCount: number,
  ): Promise<void> {
    try {
      const searchQuery = this.buildSearchQueryString(filters);
      const history = this.searchHistoryRepo.create({
        userId,
        searchQuery,
        filters: filters as unknown as Record<string, any>,
        resultCount,
      });
      await this.searchHistoryRepo.save(history);

      const count = await this.searchHistoryRepo.count({ where: { userId } });
      if (count > 100) {
        const oldest = await this.searchHistoryRepo.find({
          where: { userId },
          order: { createdAt: 'ASC' },
          take: count - 100,
        });
        if (oldest.length > 0) {
          await this.searchHistoryRepo.remove(oldest);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to save search history: ${error.message}`);
    }
  }

  private buildSearchQueryString(filters: SearchProfilesDto): string {
    const parts: string[] = [];
    if (filters.gender) parts.push(`gender:${filters.gender}`);
    if (filters.ageMin || filters.ageMax) {
      parts.push(`age:${filters.ageMin || 0}-${filters.ageMax || 100}`);
    }
    if (filters.city) parts.push(`city:${filters.city}`);
    if (filters.state) parts.push(`state:${filters.state}`);
    if (filters.country) parts.push(`country:${filters.country}`);
    if (filters.religion) parts.push(`religion:${filters.religion}`);
    if (filters.community) parts.push(`community:${filters.community}`);
    if (filters.designation) parts.push(`designation:${filters.designation}`);
    if (filters.companyName) parts.push(`company:${filters.companyName}`);
    if (filters.technologyStack) parts.push(`tech:${filters.technologyStack}`);
    return parts.join(', ') || 'all profiles';
  }
}
