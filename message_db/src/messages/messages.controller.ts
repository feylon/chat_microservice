import { Controller, Get, Query } from '@nestjs/common';
import { GetMessagesDto } from './dto/getMessages.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  getMessages(@Query() query: GetMessagesDto) {
    return this.messagesService.getMessages(query);
  }
}
