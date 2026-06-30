import {
  Controller, Get, Post, Body, Param, UseGuards,
  ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily recommendations' })
  async getDailyRecommendations(@CurrentUser('id') userId: number) {
    return this.recommendationsService.getDailyRecommendations(userId);
  }

  @Post('dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss a recommendation' })
  async dismissRecommendation(
    @CurrentUser('id') userId: number,
    @Body('recommendationId', ParseIntPipe) recommendationId: number,
  ) {
    await this.recommendationsService.dismissRecommendation(
      userId,
      recommendationId,
    );
    return { message: 'Recommendation dismissed' };
  }
}
