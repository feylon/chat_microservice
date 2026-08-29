import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsConfigModule } from './clients.module';
import { envValidationSchema } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { MessagesModule } from './messages/messages.module';
import { PresenceModule } from './presence/presence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ClientsConfigModule,
    MessagesModule,
    PresenceModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
