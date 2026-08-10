import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  send(@Body() dto: SendMessageDto) {
    return this.messagesService.send(dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  edit(@Param('id', ParseUUIDPipe) id: string, @Body() dto: EditMessageDto) {
    return this.messagesService.edit(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  remove(@Param('id', ParseUUIDPipe) id: string, @Body() dto: DeleteMessageDto) {
    return this.messagesService.remove(id, dto);
  }
}
