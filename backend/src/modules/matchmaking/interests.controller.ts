import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
  ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InterestsService } from './interests.service';
import { SendInterestDto } from './dto/send-interest.dto';

@ApiTags('Interests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send interest to a user' })
  async sendInterest(
    @CurrentUser('id') userId: number,
    @Body('toUserId', ParseIntPipe) toUserId: number,
    @Body() dto: SendInterestDto,
  ) {
    return this.interestsService.sendInterest(userId, toUserId, dto);
  }

  @Get('sent')
  @ApiOperation({ summary: 'Get interests I sent' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getSentInterests(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.interestsService.getSentInterests(
      userId,
      page || 1,
      limit || 20,
    );
  }

  @Get('received')
  @ApiOperation({ summary: 'Get interests I received' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getReceivedInterests(
    @CurrentUser('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.interestsService.getReceivedInterests(
      userId,
      page || 1,
      limit || 20,
    );
  }

  @Patch(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an interest' })
  async acceptInterest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.interestsService.acceptInterest(id, userId);
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an interest' })
  async rejectInterest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.interestsService.rejectInterest(id, userId);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a sent interest' })
  async cancelInterest(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.interestsService.cancelInterest(id, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interest details' })
  async getInterestDetails(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.interestsService.getInterestDetails(id);
  }
}
