import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsController } from './notifications.controller';
import { NotificationsService, PRESENCE_CLIENT } from './notifications.service';
import { NotificationsStore } from './notifications.store';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PRESENCE_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: config.get<string>('REDIS_HOST'),
            port: config.get<number>('REDIS_PORT'),
          },
        }),
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsStore],
})
export class NotificationsModule {}
