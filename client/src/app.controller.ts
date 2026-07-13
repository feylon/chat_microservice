import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import Redis from 'ioredis';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis

  ) { }

  @Get()
async getHello(): Promise<string> {

     this.redis.emit("user_offline", {
      
        userId : "11a"
      
    });
    console.log("User yozildi")
    return this.appService.getHello();
  }
}
