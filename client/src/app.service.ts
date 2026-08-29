import { Injectable } from '@nestjs/common';

export interface ClientConfig {
  chatApiUrl: string;
  messageWsUrl: string;
  notificationApiUrl: string;
}

@Injectable()
export class AppService {
  getConfig(): ClientConfig {
    return {
      chatApiUrl: process.env.CHAT_API_URL ?? 'http://localhost:3000/api',
      messageWsUrl: process.env.MESSAGE_WS_URL ?? 'http://localhost:3001',
      notificationApiUrl:
        process.env.NOTIFICATION_API_URL ?? 'http://localhost:3003',
    };
  }
}
