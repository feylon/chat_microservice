import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';

describe('EventController', () => {
  let controller: EventController;
  const service = {
    setOnline: jest.fn(),
    setOffline: jest.fn(),
    getStatus: jest
      .fn()
      .mockResolvedValue({ userId: 'u1', status: 'online', lastSeen: null }),
    getStatuses: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [{ provide: EventService, useValue: service }],
    }).compile();

    controller = module.get(EventController);
  });

  it('user_online hodisasini servisga uzatadi', async () => {
    await controller.onUserOnline({ userId: 'u1' });
    expect(service.setOnline).toHaveBeenCalledWith('u1');
  });

  it('user_offline hodisasini servisga uzatadi', async () => {
    await controller.onUserOffline({ userId: 'u1' });
    expect(service.setOffline).toHaveBeenCalledWith('u1');
  });

  it('holat so`rovini qaytaradi', async () => {
    await expect(
      controller.getUserStatus({ userId: 'u1' }),
    ).resolves.toMatchObject({ status: 'online' });
  });
});
