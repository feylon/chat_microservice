import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationEntity } from './entity/conversations';

describe('ConversationsService', () => {
  let service: ConversationsService;
  const repository = { findAndCount: jest.fn(), findOne: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [ConversationsService, { provide: getRepositoryToken(ConversationEntity), useValue: repository }],
    }).compile();
    service = moduleRef.get(ConversationsService);
  });

  it('foydalanuvchi suhbatlarini sahifalab qaytaradi', async () => {
    repository.findAndCount.mockResolvedValue([[{ id: 'c1' }], 11]);
    const result = await service.getUserConversations({ userId: 'u1', page: 2, limit: 10 });
    expect(repository.findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10 }));
    expect(result).toMatchObject({ total: 11, page: 2, lastPage: 2 });
  });

  it('ishtirokchini tekshiradi', async () => {
    repository.findOne.mockResolvedValue({ id: 'c1', participants: ['u1', 'u2'] });
    await expect(service.isParticipant('c1', 'u1')).resolves.toBe(true);
    await expect(service.isParticipant('c1', 'u3')).resolves.toBe(false);
  });

  it("hali yaratilmagan suhbatga qo'shilishga ruxsat beradi", async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.canJoin('new', 'u1')).resolves.toBe(true);
  });
});
