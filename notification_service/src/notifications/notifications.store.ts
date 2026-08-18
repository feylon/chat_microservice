import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Notification {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  senderId: string;
  preview: string;
  createdAt: string;
  read: boolean;
}

@Injectable()
export class NotificationsStore {
  private readonly byUser = new Map<string, Notification[]>();
  private readonly limit: number;

  constructor(config: ConfigService) {
    this.limit = Number(config.get('NOTIFICATIONS_PER_USER') ?? 50);
  }

  add(notification: Notification) {
    const list = this.byUser.get(notification.userId) ?? [];
    list.unshift(notification);
    this.byUser.set(notification.userId, list.slice(0, this.limit));
  }

  list(userId: string, onlyUnread = false): Notification[] {
    const list = this.byUser.get(userId) ?? [];
    return onlyUnread ? list.filter((item) => !item.read) : list;
  }

  markAllRead(userId: string): number {
    const list = this.byUser.get(userId) ?? [];
    let count = 0;
    for (const item of list) {
      if (!item.read) {
        item.read = true;
        count++;
      }
    }
    return count;
  }
}
