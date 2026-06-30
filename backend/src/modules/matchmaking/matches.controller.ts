import {
  Controller, Get, Delete, Param, Query, UseGuards,
  ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MatchesService } from './matches.service';

@ApiTags('Matches')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my matches' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMatches(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.matchesService.getMatches(userId, page || 1, limit || 20);
  }

  @Get('new')
  @ApiOperation({ summary: 'Get new matches today' })
  async getNewMatches(@CurrentUser('id') userId: number) {
    return this.matchesService.getNewMatches(userId);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI-based match suggestions' })
  @ApiQuery({ name: 'limit', required: false })
  async getSuggestions(
    @CurrentUser('id') userId: number,
    @Query('limit') limit?: number,
  ) {
    return this.matchesService.getSuggestions(userId, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match details' })
  async getMatchDetails(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.matchesService.getMatchDetails(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unmatch a user' })
  async unmatch(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.matchesService.unmatch(id, userId);
  }
}
