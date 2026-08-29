import { Test } from '@nestjs/testing';
import { of } from 'rxjs';
import { KAFKA_CLIENT } from '../clients.module';
import { MessagesService, TOPICS } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;
  const kafka = { emit: jest.fn(() => of(undefined)) };

  beforeEach(async () => {
    kafka.emit.mockClear();
    const moduleRef = await Test.createTestingModule({
      providers: [MessagesService, { provide: KAFKA_CLIENT, useValue: kafka }],
    }).compile();
    service = moduleRef.get(MessagesService);
  });

  it("conversationId bo'lmasa yangisini yaratadi", async () => {
    const result = await service.send({
      senderId: 'a',
      receiverId: 'b',
      content: 'salom',
      messageType: 'text',
    });
    expect(result.conversationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(kafka.emit).toHaveBeenCalledWith(
      TOPICS.save,
      expect.objectContaining({
        conversationId: result.conversationId,
        content: 'salom',
      }),
    );
  });

  it('tahrirlash hodisasini yuboradi', async () => {
    await service.edit('m1', { senderId: 's1', content: 'yangi' });
    expect(kafka.emit).toHaveBeenCalledWith(TOPICS.edit, {
      messageId: 'm1',
      senderId: 's1',
      content: 'yangi',
    });
  });

  it("o'chirish hodisasini yuboradi", async () => {
    await service.remove('m1', { senderId: 's1' });
    expect(kafka.emit).toHaveBeenCalledWith(TOPICS.delete, {
      messageId: 'm1',
      senderId: 's1',
    });
  });
});
