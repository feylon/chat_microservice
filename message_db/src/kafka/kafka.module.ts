import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Partitioners } from 'kafkajs';
import { parseBrokers } from '../config/env.validation';

export const KAFKA_CLIENT = 'KAFKA_CLIENT';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: `${config.get<string>('KAFKA_CLIENT_ID')}-producer`,
              brokers: parseBrokers(config.get<string>('KAFKA_BROKERS')),
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
            producerOnlyMode: true,
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
