import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { UserOfflineDto } from './dto/userOffline.dto';
import { UserOnlineDto } from './dto/userOnline.dto';
import { EventService } from './event.service';

@Controller()
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly eventService: EventService) {}

  @EventPattern('user_online')
  async onUserOnline(@Payload() data: UserOnlineDto) {
    await this.eventService.setOnline(data.userId);
    this.logger.log(`${data.userId} online`);
  }

  @EventPattern('user_offline')
  async onUserOffline(@Payload() data: UserOfflineDto) {
    await this.eventService.setOffline(data.userId);
    this.logger.log(`${data.userId} offline`);
  }
}
