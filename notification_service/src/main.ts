import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { parseBrokers } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: config.get<string>('KAFKA_CLIENT_ID'),
          brokers: parseBrokers(config.get<string>('KAFKA_BROKERS')),
        },
        consumer: { groupId: config.get<string>('KAFKA_GROUP_ID')! },
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  const port = config.get<number>('PORT') ?? 3003;
  await app.listen(port);
  Logger.log(`Notification service ishga tushdi: http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
