import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MessageSavedEventDto } from './dto/messageSaved.dto';
import { NotificationsService } from './notifications.service';
import { NotificationsStore } from './notifications.store';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly store: NotificationsStore,
  ) {}

  @EventPattern('message_saved_success')
  async onMessageSaved(@Payload() event: MessageSavedEventDto) {
    await this.notificationsService.handleMessageSaved(event);
  }

  @Get(':userId')
  list(
    @Param('userId') userId: string,
    @Query('unread', new ParseBoolPipe({ optional: true })) unread?: boolean,
  ) {
    const data = this.store.list(userId, unread ?? false);
    return { data, total: data.length };
  }

  @Patch(':userId/read')
  markAllRead(@Param('userId') userId: string) {
    return { updated: this.store.markAllRead(userId) };
  }
}
