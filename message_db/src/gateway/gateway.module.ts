import { Module } from '@nestjs/common';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { ChatGateway } from './chat.gateway';
import { MessagesEventsController } from './messages.events.controller';

@Module({
  imports: [MessagesModule, ConversationsModule],
  controllers: [MessagesEventsController],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class GatewayModule {}
