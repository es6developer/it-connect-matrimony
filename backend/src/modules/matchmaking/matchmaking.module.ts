import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { CompatibilityService } from './services/compatibility.service';
import { RecommendationEngineService } from './services/recommendation-engine.service';

import { Interest } from '../../database/entities/interest.entity';
import { Match } from '../../database/entities/match.entity';
import { DailyRecommendation } from '../../database/entities/daily-recommendation.entity';
import { Profile } from '../../database/entities/profile.entity';
import { User } from '../../database/entities/user.entity';
import { PartnerPreference } from '../../database/entities/partner-preference.entity';
import { Notification } from '../../database/entities/notification.entity';
import { BlockedUser } from '../../database/entities/blocked-user.entity';
import { SavedSearch } from '../../database/entities/saved-search.entity';
import { SearchHistory } from '../../database/entities/search-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Interest,
      Match,
      DailyRecommendation,
      Profile,
      User,
      PartnerPreference,
      Notification,
      BlockedUser,
      SavedSearch,
      SearchHistory,
    ]),
  ],
  controllers: [
    InterestsController,
    MatchesController,
    RecommendationsController,
    SearchController,
  ],
  providers: [
    InterestsService,
    MatchesService,
    RecommendationsService,
    SearchService,
    CompatibilityService,
    RecommendationEngineService,
  ],
  exports: [
    InterestsService,
    MatchesService,
    RecommendationsService,
    SearchService,
    CompatibilityService,
  ],
})
export class MatchmakingModule {}
