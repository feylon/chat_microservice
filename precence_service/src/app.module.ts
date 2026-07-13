import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { Keyv, KeyvCacheableMemory } from 'cacheable';
import KeyvRedis from '@keyv/redis';
import { EventModule } from './event/event.module';

@Global()
@Module({
   imports: [
   
    EventModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
