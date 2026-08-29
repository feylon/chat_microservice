import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { lastValueFrom, timeout } from 'rxjs';
import { MessageSavedEventDto } from './dto/messageSaved.dto';
import { Notification, NotificationsStore } from './notifications.store';

export const PRESENCE_CLIENT = 'PRESENCE_CLIENT';

interface UserPresence {
  userId: string;
  status: 'online' | 'offline';
}

const PREVIEW_LENGTH = 80;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(PRESENCE_CLIENT) private readonly presence: ClientProxy,
    private readonly store: NotificationsStore,
  ) {}

  async handleMessageSaved(
    event: MessageSavedEventDto,
  ): Promise<Notification[]> {
    const receivers = [...new Set(event.receivers)].filter(
      (id) => id !== event.message.senderId,
    );
    if (receivers.length === 0) {
      return [];
    }

    const offline = await this.findOfflineUsers(receivers);
    const created = offline.map((userId) =>
      this.buildNotification(userId, event),
    );

    for (const notification of created) {
      this.store.add(notification);
      this.logger.log(
        `Offline foydalanuvchi ${notification.userId} uchun bildirishnoma yaratildi`,
      );
    }

    return created;
  }

  private async findOfflineUsers(userIds: string[]): Promise<string[]> {
    try {
      const statuses = await lastValueFrom(
        this.presence
          .send<UserPresence[]>('get_users_status', { userIds })
          .pipe(timeout(3000)),
      );
      return statuses
        .filter((item) => item.status !== 'online')
        .map((item) => item.userId);
    } catch (error) {
      this.logger.warn(
        `Presence xizmatidan javob olinmadi, barcha qabul qiluvchilar offline deb hisoblandi: ${String(error)}`,
      );
      return userIds;
    }
  }

  private buildNotification(
    userId: string,
    event: MessageSavedEventDto,
  ): Notification {
    const { message } = event;
    const text =
      message.messageType === 'file'
        ? 'Fayl yuborildi'
        : (message.content ?? '');
    return {
      id: randomUUID(),
      userId,
      conversationId: message.conversationId,
      messageId: message.id,
      senderId: message.senderId,
      preview:
        text.length > PREVIEW_LENGTH
          ? `${text.slice(0, PREVIEW_LENGTH)}...`
          : text,
      createdAt: new Date().toISOString(),
      read: false,
    };
  }
}
