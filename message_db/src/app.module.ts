import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';
import { chatGateway } from './gateway/chat.gateway';
import { ClientKafka, ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaModule } from './kafka/kafka.module';
import { ConversationsService } from './conversations/conversations.service';
import { ConversationEntity } from './conversations/entity/conversations';


@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity]),
    KafkaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST') || 'postgres', // docker-compose'dagi nomi
        port: configService.get<number>('DATABASE_PORT') || 5432,
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        synchronize: false,
        autoLoadEntities: true,
        logging: true,
      }),
    }),
    MessagesModule,
    ConversationsModule,
    FilesModule,
    UsersModule,
  ],
  providers: [ConversationsService]
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject('KAFKA_CLIENT') private client: ClientKafka
  ) { }


  onModuleInit(

  ) {
    this.client.connect();
    console.info("[Microserive => Microservice] Kafkaga ulanish amalga oshirildi ")
  }
}