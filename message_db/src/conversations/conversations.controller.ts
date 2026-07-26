import { Controller, Get, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { GetConversationsDto } from './dto/getConversations.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  getUserConversations(@Query() query: GetConversationsDto) {
    return this.conversationsService.getUserConversations(query);
  }
}
