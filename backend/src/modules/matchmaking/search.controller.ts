import {
  Controller, Get, Post, Delete, Body, Param, Query, UseGuards,
  ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SearchService } from './search.service';
import { SearchProfilesDto } from './dto/search-profiles.dto';

@ApiTags('Search')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search profiles with filters' })
  async searchProfiles(
    @CurrentUser('id') userId: number,
    @Query() filters: SearchProfilesDto,
  ) {
    return this.searchService.searchProfiles(userId, filters);
  }

  @Post('saved')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a search' })
  async saveSearch(
    @CurrentUser('id') userId: number,
    @Body('name') name: string,
    @Body('filters') filters: Record<string, any>,
  ) {
    return this.searchService.saveSearch(userId, name, filters);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved searches' })
  async getSavedSearches(@CurrentUser('id') userId: number) {
    return this.searchService.getSavedSearches(userId);
  }

  @Delete('saved/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved search' })
  async deleteSavedSearch(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.searchService.deleteSavedSearch(id, userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get search history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getSearchHistory(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.getSearchHistory(
      userId,
      page || 1,
      limit || 20,
    );
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear search history' })
  async clearSearchHistory(@CurrentUser('id') userId: number) {
    await this.searchService.clearSearchHistory(userId);
  }
}
