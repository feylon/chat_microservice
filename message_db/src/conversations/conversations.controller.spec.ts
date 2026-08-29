import { Test } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

describe('ConversationsController', () => {
  it('suhbatlar ro`yxatini servisdan oladi', async () => {
    const service = {
      getUserConversations: jest.fn().mockResolvedValue({ data: [] }),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [{ provide: ConversationsService, useValue: service }],
    }).compile();

    const controller = moduleRef.get(ConversationsController);
    await expect(
      controller.getUserConversations({ userId: 'u1', page: 1, limit: 10 }),
    ).resolves.toEqual({ data: [] });
  });
});
