import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { PRESENCE_CLIENT } from '../clients.module';

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline';
  lastSeen: string | null;
}

@Injectable()
export class PresenceService {
  constructor(
    @Inject(PRESENCE_CLIENT) private readonly presence: ClientProxy,
  ) {}

  async online(userId: string) {
    await lastValueFrom(this.presence.emit('user_online', { userId }));
    return { userId, status: 'online' };
  }

  async offline(userId: string) {
    await lastValueFrom(this.presence.emit('user_offline', { userId }));
    return { userId, status: 'offline' };
  }

  async heartbeat(userId: string) {
    await lastValueFrom(this.presence.emit('user_heartbeat', { userId }));
    return { userId, status: 'online' };
  }

  async status(userId: string): Promise<UserPresence> {
    try {
      return await lastValueFrom(
        this.presence
          .send<UserPresence>('get_user_status', { userId })
          .pipe(timeout(3000)),
      );
    } catch {
      throw new ServiceUnavailableException('Presence xizmati javob bermadi');
    }
  }
}
