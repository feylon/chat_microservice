import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PresenceDto } from './dto/presence.dto';
import { PresenceService } from './presence.service';

@Controller('presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('online')
  @HttpCode(HttpStatus.ACCEPTED)
  online(@Body() dto: PresenceDto) {
    return this.presenceService.online(dto.userId);
  }

  @Post('offline')
  @HttpCode(HttpStatus.ACCEPTED)
  offline(@Body() dto: PresenceDto) {
    return this.presenceService.offline(dto.userId);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.ACCEPTED)
  heartbeat(@Body() dto: PresenceDto) {
    return this.presenceService.heartbeat(dto.userId);
  }

  @Get(':userId')
  status(@Param('userId') userId: string) {
    return this.presenceService.status(userId);
  }
}
