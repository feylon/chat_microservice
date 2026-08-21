import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainError } from '../common/domain.error';
import { MessageEntity } from './entity/messages';
import { EDIT_WINDOW_MS, MessagesService } from './messages.service';

const SENDER = '11111111-1111-4111-8111-111111111111';
const RECEIVER = '22222222-2222-4222-8222-222222222222';
const CONVERSATION = '33333333-3333-4333-8333-333333333333';

describe('MessagesService', () => {
  let service: MessagesService;
  const repository = {
    findOne: jest.fn(),
    save: jest.fn((entity: unknown) => Promise.resolve(entity)),
    findAndCount: jest.fn(),
  };
  const manager = {
    findOne: jest.fn(),
    create: jest.fn((_entity: unknown, data: object) => ({ ...data })),
    save: jest.fn((entity: object) => Promise.resolve({ id: 'generated', ...entity })),
  };
  const dataSource = {
    transaction: jest.fn((work: (m: typeof manager) => unknown) => work(manager)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(MessageEntity), useValue: repository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = moduleRef.get(MessagesService);
  });

  describe('saveMessage', () => {
    it('yangi suhbatni yaratib saqlaydi', async () => {
      manager.findOne.mockResolvedValue(null);

      const { receiverIds } = await service.saveMessage({
        conversationId: CONVERSATION,
        senderId: SENDER,
        receiverId: RECEIVER,
        content: 'Salom',
        messageType: 'text',
      });

      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: CONVERSATION, participants: [SENDER, RECEIVER] }),
      );
      expect(receiverIds).toEqual([RECEIVER]);
    });

    it("mavjud suhbatga yangi ishtirokchini qo'shadi", async () => {
      manager.findOne.mockResolvedValue({ id: CONVERSATION, participants: [SENDER] });

      const { receiverIds } = await service.saveMessage({
        conversationId: CONVERSATION,
        senderId: SENDER,
        receiverId: RECEIVER,
        content: 'Salom',
        messageType: 'text',
      });

      expect(receiverIds).toEqual([RECEIVER]);
    });
  });

  describe('editMessage', () => {
    const base = { id: 'm1', senderId: SENDER, conversationId: CONVERSATION, messageType: 'text' };

    it('muallif bo`lmasa rad etadi', async () => {
      repository.findOne.mockResolvedValue({ ...base, senderId: RECEIVER, createdAt: new Date() });
      await expect(
        service.editMessage({ messageId: 'm1', senderId: SENDER, content: 'x' }),
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('1 sutkadan keyin tahrirlashga ruxsat bermaydi', async () => {
      repository.findOne.mockResolvedValue({ ...base, createdAt: new Date(Date.now() - EDIT_WINDOW_MS - 1000) });
      await expect(
        service.editMessage({ messageId: 'm1', senderId: SENDER, content: 'x' }),
      ).rejects.toMatchObject({ code: 'EDIT_WINDOW_EXPIRED' });
    });

    it('xabar topilmasa DomainError qaytaradi', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(
        service.editMessage({ messageId: 'm1', senderId: SENDER, content: 'x' }),
      ).rejects.toBeInstanceOf(DomainError);
    });

    it('matnni yangilaydi', async () => {
      repository.findOne.mockResolvedValue({ ...base, content: 'eski', createdAt: new Date() });
      const result = await service.editMessage({ messageId: 'm1', senderId: SENDER, content: 'yangi' });
      expect(result.content).toBe('yangi');
    });
  });

  describe('deleteMessage', () => {
    it("xabarni o'chirilgan deb belgilaydi", async () => {
      repository.findOne.mockResolvedValue({ id: 'm1', senderId: SENDER, conversationId: CONVERSATION, isDelete: false });
      await expect(service.deleteMessage({ messageId: 'm1', senderId: SENDER })).resolves.toEqual({
        messageId: 'm1',
        conversationId: CONVERSATION,
      });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ isDelete: true }));
    });

    it("boshqa foydalanuvchi o'chira olmaydi", async () => {
      repository.findOne.mockResolvedValue({ id: 'm1', senderId: RECEIVER, conversationId: CONVERSATION });
      await expect(service.deleteMessage({ messageId: 'm1', senderId: SENDER })).rejects.toMatchObject({
        code: 'FORBIDDEN',
      });
    });
  });

  it('xabarlarni sahifalab, eskidan yangiga qaytaradi', async () => {
    repository.findAndCount.mockResolvedValue([[{ id: '2' }, { id: '1' }], 3]);
    const result = await service.getMessages({ conversationId: CONVERSATION, page: 1, limit: 2 });
    expect(result.data.map((m) => m.id)).toEqual(['1', '2']);
    expect(result.lastPage).toBe(2);
  });
});
