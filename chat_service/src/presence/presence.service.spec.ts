import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { PRESENCE_CLIENT } from '../clients.module';
import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  let service: PresenceService;
  const client = { emit: jest.fn(() => of(undefined)), send: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        PresenceService,
        { provide: PRESENCE_CLIENT, useValue: client },
      ],
    }).compile();
    service = moduleRef.get(PresenceService);
  });

  it('online hodisasini yuboradi', async () => {
    await service.online('u1');
    expect(client.emit).toHaveBeenCalledWith('user_online', { userId: 'u1' });
  });

  it('holatni qaytaradi', async () => {
    client.send.mockReturnValue(
      of({ userId: 'u1', status: 'online', lastSeen: null }),
    );
    await expect(service.status('u1')).resolves.toMatchObject({
      status: 'online',
    });
  });

  it('presence ishlamasa 503 qaytaradi', async () => {
    client.send.mockReturnValue(throwError(() => new Error('down')));
    await expect(service.status('u1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
