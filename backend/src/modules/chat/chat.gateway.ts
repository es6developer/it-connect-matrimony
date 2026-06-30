import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userUuid?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients: Map<string, Set<string>> = new Map();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: no token`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      client.userUuid = payload.sub;

      client.join(`user:${payload.sub}`);

      if (!this.connectedClients.has(payload.sub)) {
        this.connectedClients.set(payload.sub, new Set());
      }
      this.connectedClients.get(payload.sub).add(client.id);

      this.logger.log(`Client ${client.id} connected as user ${payload.sub}`);
      client.emit('connected', { userId: payload.sub });
    } catch (error) {
      this.logger.warn(`Client ${client.id} connection rejected: invalid token`);
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userUuid = client.userUuid;
    if (userUuid && this.connectedClients.has(userUuid)) {
      this.connectedClients.get(userUuid).delete(client.id);
      if (this.connectedClients.get(userUuid).size === 0) {
        this.connectedClients.delete(userUuid);
      }
    }
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('conversation:join')
  async handleConversationJoin(client: AuthenticatedSocket, payload: { conversationId: string }) {
    if (!client.userUuid) {
      throw new WsException('Unauthenticated');
    }
    const room = `conversation:${payload.conversationId}`;
    client.join(room);
    this.logger.log(`User ${client.userUuid} joined room ${room}`);
    return { event: 'conversation:joined', data: { conversationId: payload.conversationId } };
  }

  @SubscribeMessage('conversation:leave')
  async handleConversationLeave(client: AuthenticatedSocket, payload: { conversationId: string }) {
    if (!client.userUuid) {
      throw new WsException('Unauthenticated');
    }
    const room = `conversation:${payload.conversationId}`;
    client.leave(room);
    this.logger.log(`User ${client.userUuid} left room ${room}`);
    return { event: 'conversation:left', data: { conversationId: payload.conversationId } };
  }

  @SubscribeMessage('message:send')
  async handleMessage(client: AuthenticatedSocket, payload: { conversationId: string; content: string; type: string; mediaUrl?: string }) {
    if (!client.userUuid) {
      throw new WsException('Unauthenticated');
    }

    try {
      const result = await this.chatService.sendMessage(
        client.userUuid,
        payload.conversationId,
        payload.content,
        payload.type || 'text',
        payload.mediaUrl,
      );

      const messageData = result.data;
      this.server.to(`conversation:${payload.conversationId}`).emit('message:new', messageData);

      return { event: 'message:sent', data: messageData };
    } catch (error) {
      this.logger.error('Failed to send message', error);
      client.emit('error', { message: error.message || 'Failed to send message' });
    }
  }

  @SubscribeMessage('message:typing')
  async handleTyping(client: AuthenticatedSocket, payload: { conversationId: string }) {
    if (!client.userUuid) return;
    client.to(`conversation:${payload.conversationId}`).emit('message:typing', {
      conversationId: payload.conversationId,
      userId: client.userUuid,
      isTyping: true,
    });
  }

  @SubscribeMessage('message:stop-typing')
  async handleStopTyping(client: AuthenticatedSocket, payload: { conversationId: string }) {
    if (!client.userUuid) return;
    client.to(`conversation:${payload.conversationId}`).emit('message:typing', {
      conversationId: payload.conversationId,
      userId: client.userUuid,
      isTyping: false,
    });
  }

  @SubscribeMessage('message:read')
  async handleRead(client: AuthenticatedSocket, payload: { conversationId: string }) {
    if (!client.userUuid) {
      throw new WsException('Unauthenticated');
    }

    try {
      await this.chatService.markAsRead(payload.conversationId, client.userUuid);
      this.server.to(`conversation:${payload.conversationId}`).emit('message:read', {
        conversationId: payload.conversationId,
        readBy: client.userUuid,
      });
    } catch (error) {
      this.logger.error('Failed to mark as read', error);
    }
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token;
    if (auth) return auth;

    const query = client.handshake.query?.token;
    if (query) return query as string;

    const headers = client.handshake.headers;
    const authorization = headers?.authorization;
    if (authorization) {
      const parts = authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        return parts[1];
      }
    }

    return null;
  }
}
