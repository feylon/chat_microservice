import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { ConversationEntity } from './entity/conversations';
import { GetConversationsDto } from './dto/getConversations.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversations: Repository<ConversationEntity>,
  ) {}

  async getUserConversations(dto: GetConversationsDto) {
    const { userId, page, limit } = dto;

    const [data, total] = await this.conversations.findAndCount({
      where: { participants: Like(`%${userId}%`) },
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async isParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const conversation = await this.conversations.findOne({
      where: { id: conversationId },
    });
    return !!conversation && conversation.participants.includes(userId);
  }

  async canJoin(conversationId: string, userId: string): Promise<boolean> {
    const conversation = await this.conversations.findOne({
      where: { id: conversationId },
    });
    return !conversation || conversation.participants.includes(userId);
  }
}
