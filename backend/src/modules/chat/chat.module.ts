import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Conversation } from '../../database/entities/conversation.entity';
import { ConversationParticipant } from '../../database/entities/conversation-participant.entity';
import { Message } from '../../database/entities/message.entity';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      Message,
      Report,
      User,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, JwtService, ConfigService],
  exports: [ChatService],
})
export class ChatModule {}
