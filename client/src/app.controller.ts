import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('config.json')
  getConfig() {
    return this.appService.getConfig();
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'demo-client' };
  }
}
