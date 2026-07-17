import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entity/messages';
import { ConversationEntity } from '../conversations/entity/conversations';
import { chatGateway } from '../gateway/chat.gateway';
import { ConversationsService } from '../conversations/conversations.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, ConversationEntity])],
  controllers: [MessagesController],
  providers: [MessagesService, chatGateway, ConversationsService],
  exports : [MessagesService]
})
export class MessagesModule {}
