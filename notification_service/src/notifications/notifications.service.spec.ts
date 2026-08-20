import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { NotificationsService, PRESENCE_CLIENT } from './notifications.service';
import { NotificationsStore } from './notifications.store';

const event = {
  message: { id: 'm1', conversationId: 'c1', senderId: 'a', content: 'Salom!', messageType: 'text' },
  receivers: ['b', 'c'],
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let store: NotificationsStore;
  const presence = { send: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        NotificationsStore,
        { provide: PRESENCE_CLIENT, useValue: presence },
        { provide: ConfigService, useValue: { get: () => 50 } },
      ],
    }).compile();
    service = moduleRef.get(NotificationsService);
    store = moduleRef.get(NotificationsStore);
  });

  it('faqat offline foydalanuvchilarga bildirishnoma yaratadi', async () => {
    presence.send.mockReturnValue(
      of([
        { userId: 'b', status: 'online' },
        { userId: 'c', status: 'offline' },
      ]),
    );
    const created = await service.handleMessageSaved(event);
    expect(created.map((n) => n.userId)).toEqual(['c']);
    expect(store.list('c')).toHaveLength(1);
    expect(store.list('b')).toHaveLength(0);
  });

  it('presence ishlamasa barcha qabul qiluvchilarni offline deb hisoblaydi', async () => {
    presence.send.mockReturnValue(throwError(() => new Error('down')));
    const created = await service.handleMessageSaved(event);
    expect(created).toHaveLength(2);
  });

  it("yuboruvchining o'ziga bildirishnoma yubormaydi", async () => {
    const created = await service.handleMessageSaved({ ...event, receivers: ['a'] });
    expect(created).toEqual([]);
    expect(presence.send).not.toHaveBeenCalled();
  });

  it("o'qilgan deb belgilaydi", async () => {
    presence.send.mockReturnValue(of([{ userId: 'b', status: 'offline' }, { userId: 'c', status: 'offline' }]));
    await service.handleMessageSaved(event);
    expect(store.markAllRead('b')).toBe(1);
    expect(store.list('b', true)).toHaveLength(0);
  });
});
