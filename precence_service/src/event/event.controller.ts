import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { GetUserStatusDto, GetUsersStatusDto } from './dto/getStatus.dto';
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

  @EventPattern('user_heartbeat')
  async onHeartbeat(@Payload() data: UserOnlineDto) {
    await this.eventService.setOnline(data.userId);
  }

  @MessagePattern('get_user_status')
  getUserStatus(@Payload() data: GetUserStatusDto) {
    return this.eventService.getStatus(data.userId);
  }

  @MessagePattern('get_users_status')
  getUsersStatus(@Payload() data: GetUsersStatusDto) {
    return this.eventService.getStatuses(data.userIds);
  }
}
