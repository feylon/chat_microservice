import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCacheEntity } from './entity/users_cache';

@Module({
  imports: [TypeOrmModule.forFeature([UserCacheEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
