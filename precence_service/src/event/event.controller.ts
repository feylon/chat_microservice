import { Controller, Inject } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { UserOnlineDto } from './dto/userOnline.dto';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import Redis from 'ioredis';
import { UserOfflineDto } from './dto/userOffline.dto';

// @Controller('event')
export class EventController {

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Redis) { }



    @MessagePattern('user_online')
    async set_online_user(@Payload() data: UserOnlineDto, @Ctx() context: RedisContext) {
        console.log(data.userId)
        await this.cacheManager.set(`user_isonline${data.userId}`, JSON.stringify(
            {
                userId: data.userId,
                status: "online"
            }
        ))
        return;;
    }

    @MessagePattern('user_offline')
    async set_offline_user(@Payload() data: UserOfflineDto) {
        console.log(data);
        const foundData = await this.cacheManager.get(`user_isonline${data.userId}`);
        console.log(foundData)
        await this.cacheManager.del(`user_isonline${data.userId}`)

        const foundData1 = await this.cacheManager.get(`user_isonline${data.userId}`);
        console.log(foundData1)
    }

}
