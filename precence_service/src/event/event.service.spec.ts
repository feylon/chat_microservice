import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS } from '../redis/redis.module';
import { EventService, LAST_SEEN_KEY, ONLINE_KEY } from './event.service';

const createRedisMock = () => {
  const store = new Map<string, string>();
  const multi = () => {
    const ops: Array<() => void> = [];
    const chain = {
      set: (key: string, value: string) => {
        ops.push(() => store.set(key, value));
        return chain;
      },
      del: (key: string) => {
        ops.push(() => store.delete(key));
        return chain;
      },
      exec: () => {
        ops.forEach((op) => op());
        return Promise.resolve([]);
      },
    };
    return chain;
  };
  return {
    store,
    multi,
    mget: (...keys: string[]) => Promise.resolve(keys.map((key) => store.get(key) ?? null)),
  };
};

describe('EventService', () => {
  let service: EventService;
  let redis: ReturnType<typeof createRedisMock>;

  beforeEach(async () => {
    redis = createRedisMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: REDIS, useValue: redis },
        { provide: ConfigService, useValue: { get: () => '120' } },
      ],
    }).compile();

    service = module.get(EventService);
  });

  it('foydalanuvchini online qiladi', async () => {
    await service.setOnline('u1');
    expect(redis.store.has(ONLINE_KEY('u1'))).toBe(true);
    await expect(service.getStatus('u1')).resolves.toMatchObject({ status: 'online' });
  });

  it('foydalanuvchini offline qiladi va oxirgi faollikni saqlaydi', async () => {
    await service.setOnline('u1');
    await service.setOffline('u1');
    const status = await service.getStatus('u1');
    expect(status.status).toBe('offline');
    expect(status.lastSeen).toBe(redis.store.get(LAST_SEEN_KEY('u1')));
  });

  it("noma'lum foydalanuvchi offline hisoblanadi", async () => {
    await expect(service.getStatus('nobody')).resolves.toEqual({
      userId: 'nobody',
      status: 'offline',
      lastSeen: null,
    });
  });

  it('bir nechta foydalanuvchi holatini qaytaradi', async () => {
    await service.setOnline('a');
    const statuses = await service.getStatuses(['a', 'b']);
    expect(statuses.map((s) => s.status)).toEqual(['online', 'offline']);
  });
});
