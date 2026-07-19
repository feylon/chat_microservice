import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ConversationEntity } from './src/conversations/entity/conversations';
import { MessageEntity } from './src/messages/entity/messages';
import { FileEntity } from './src/files/entity/files';
import { UserCacheEntity } from './src/users/entity/users_cache';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: parseInt(process.env.DATABASE_PORT ?? '5433', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [ConversationEntity, MessageEntity, FileEntity, UserCacheEntity],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
