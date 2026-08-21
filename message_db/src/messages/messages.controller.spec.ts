import { Test } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

describe('MessagesController', () => {
  it('xabarlar ro`yxatini servisdan oladi', async () => {
    const service = { getMessages: jest.fn().mockResolvedValue({ data: [], total: 0 }) };
    const moduleRef = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: service }],
    }).compile();

    const controller = moduleRef.get(MessagesController);
    const query = { conversationId: 'c1', page: 1, limit: 10 };
    await expect(controller.getMessages(query)).resolves.toEqual({ data: [], total: 0 });
    expect(service.getMessages).toHaveBeenCalledWith(query);
  });
});
