import { Logger, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from '../conversations/conversations.service';
import { GetConversationsDto } from '../conversations/dto/getConversations.dto';
import { GetMessagesDto } from '../messages/dto/getMessages.dto';
import { MessagesService } from '../messages/messages.service';
import { JoinRoomDto } from './dto/joinRoom.dto';
import { WebSocketValidationPipe } from './WebSocketValidationPipe';

export const userRoom = (userId: string) => `user:${userId}`;

@UsePipes(new WebSocketValidationPipe())
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (userId) {
      client.data.userId = userId;
      void client.join(userRoom(userId));
    }
    this.logger.log(
      `Ulandi: ${client.id}${userId ? ` (user: ${userId})` : ''}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Uzildi: ${client.id}`);
  }

  sendToRoom(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data);
  }

  sendToUser(userId: string, event: string, data: unknown) {
    this.server.to(userRoom(userId)).emit(event, data);
  }

  sendError(userId: string, data: { code: string; message: string }) {
    this.sendToUser(userId, 'error_notification', data);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId as string | undefined;
    if (
      userId &&
      !(await this.conversationsService.canJoin(body.conversationId, userId))
    ) {
      throw new WsException('Siz bu suhbat ishtirokchisi emassiz');
    }
    await client.join(body.conversationId);
    return {
      event: 'joined_room',
      data: { conversationId: body.conversationId },
    };
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(body.conversationId);
    return {
      event: 'left_room',
      data: { conversationId: body.conversationId },
    };
  }

  @SubscribeMessage('get_conversations')
  async handleGetConversations(@MessageBody() body: GetConversationsDto) {
    const conversations =
      await this.conversationsService.getUserConversations(body);
    return { event: 'conversations_list', data: conversations };
  }

  @SubscribeMessage('get_messages')
  async handleGetMessages(@MessageBody() body: GetMessagesDto) {
    const messages = await this.messagesService.getMessages(body);
    return { event: 'messages_list', data: messages };
  }

  private extractUserId(client: Socket): string | undefined {
    const fromAuth = (
      client.handshake.auth as Record<string, unknown> | undefined
    )?.userId;
    const fromQuery = client.handshake.query?.userId;
    const value = fromAuth ?? fromQuery;
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  }
}
