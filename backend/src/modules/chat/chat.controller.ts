import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ReportMessageDto } from './dto/report-message.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Chat')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get my conversations' })
  @ApiResponse({ status: 200, description: 'Conversations fetched successfully' })
  async getConversations(
    @CurrentUser('id') userId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatService.getConversations(String(userId), pagination);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new conversation (start chat)' })
  @ApiResponse({ status: 201, description: 'Conversation created' })
  @ApiResponse({ status: 409, description: 'Conversation already exists' })
  async createConversation(
    @CurrentUser('id') userId: number,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(String(userId), dto.participantId, dto.initialMessage);
  }

  @Get('conversations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get conversation details' })
  @ApiResponse({ status: 200, description: 'Conversation fetched' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversation(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
  ) {
    return this.chatService.getConversation(id, String(userId));
  }

  @Get('conversations/:id/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get messages for a conversation (paginated)' })
  @ApiResponse({ status: 200, description: 'Messages fetched' })
  async getMessages(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatService.getMessages(id, String(userId), pagination);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete conversation (soft delete)' })
  @ApiResponse({ status: 200, description: 'Conversation deleted' })
  async deleteConversation(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
  ) {
    return this.chatService.deleteConversation(id, String(userId));
  }

  @Post('messages/:id/report')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report a message' })
  @ApiResponse({ status: 201, description: 'Message reported' })
  async reportMessage(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
    @Body() dto: ReportMessageDto,
  ) {
    return this.chatService.reportMessage(String(userId), id, dto.reason);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload file/image for chat' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @CurrentUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.chatService.uploadFile(file, String(userId));
  }
}
