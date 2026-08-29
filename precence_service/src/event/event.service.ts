import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.module';

export type PresenceStatus = 'online' | 'offline';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: string | null;
}

export const ONLINE_KEY = (userId: string) => `presence:online:${userId}`;
export const LAST_SEEN_KEY = (userId: string) => `presence:last_seen:${userId}`;

@Injectable()
export class EventService {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    config: ConfigService,
  ) {
    this.ttlSeconds = Number(config.get<string>('PRESENCE_TTL_SECONDS', '120'));
  }

  async setOnline(userId: string): Promise<UserPresence> {
    const now = new Date().toISOString();
    await this.redis
      .multi()
      .set(ONLINE_KEY(userId), now, 'EX', this.ttlSeconds)
      .set(LAST_SEEN_KEY(userId), now)
      .exec();
    return { userId, status: 'online', lastSeen: now };
  }

  async setOffline(userId: string): Promise<UserPresence> {
    const now = new Date().toISOString();
    await this.redis
      .multi()
      .del(ONLINE_KEY(userId))
      .set(LAST_SEEN_KEY(userId), now)
      .exec();
    return { userId, status: 'offline', lastSeen: now };
  }

  async getStatus(userId: string): Promise<UserPresence> {
    const [online, lastSeen] = await this.redis.mget(
      ONLINE_KEY(userId),
      LAST_SEEN_KEY(userId),
    );
    return {
      userId,
      status: online ? 'online' : 'offline',
      lastSeen: lastSeen ?? null,
    };
  }

  async getStatuses(userIds: string[]): Promise<UserPresence[]> {
    return Promise.all(userIds.map((userId) => this.getStatus(userId)));
  }
}
