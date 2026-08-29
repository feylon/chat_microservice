import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConversationEntity } from '../conversations/entity/conversations';
import { FileEntity } from '../files/entity/files';
import { DomainError } from '../common/domain.error';
import { MessageEntity } from './entity/messages';
import { CreateMessageDTO } from './dto/createMessage';
import { EditMessageDTO } from './dto/editMessage';
import { DeleteMessageDTO } from './dto/deleteMessage';
import { GetMessagesDto } from './dto/getMessages.dto';

export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messages: Repository<MessageEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async saveMessage(body: CreateMessageDTO) {
    return this.dataSource.transaction(async (manager) => {
      let conversation = await manager.findOne(ConversationEntity, {
        where: { id: body.conversationId },
      });

      if (!conversation) {
        conversation = manager.create(ConversationEntity, {
          id: body.conversationId,
          participants: [body.senderId, body.receiverId],
        });
      } else {
        for (const participant of [body.senderId, body.receiverId]) {
          if (!conversation.participants.includes(participant)) {
            conversation.participants.push(participant);
          }
        }
      }

      conversation.updatedAt = new Date();
      conversation = await manager.save(conversation);

      const message = manager.create(MessageEntity, {
        conversationId: conversation.id,
        senderId: body.senderId,
        content: body.content ?? null,
        messageType: body.messageType,
      });
      const savedMessage = await manager.save(message);

      if (body.messageType === 'file' && body.file) {
        const file = manager.create(FileEntity, {
          ...body.file,
          messageId: savedMessage.id,
        });
        savedMessage.file = await manager.save(file);
      }

      const receiverIds = conversation.participants.filter(
        (id) => id !== body.senderId,
      );

      return { savedMessage, receiverIds };
    });
  }

  async editMessage(body: EditMessageDTO) {
    const message = await this.messages.findOne({
      where: { id: body.messageId, isDelete: false },
    });

    if (!message) {
      throw new DomainError(
        'MESSAGE_NOT_FOUND',
        `${body.messageId} xabari topilmadi`,
      );
    }

    if (message.senderId !== body.senderId) {
      throw new DomainError(
        'FORBIDDEN',
        'Faqat xabar muallifi uni tahrirlashi mumkin',
      );
    }

    if (message.messageType !== 'text') {
      throw new DomainError(
        'NOT_EDITABLE',
        'Faqat matnli xabarlarni tahrirlash mumkin',
      );
    }

    if (Date.now() - new Date(message.createdAt).getTime() > EDIT_WINDOW_MS) {
      throw new DomainError(
        'EDIT_WINDOW_EXPIRED',
        `Tahrirlash vaqti 1 sutkadan o'tib ketdi (MessageID: ${body.messageId})`,
      );
    }

    message.content = body.content;
    return this.messages.save(message);
  }

  async deleteMessage(body: DeleteMessageDTO) {
    const message = await this.messages.findOne({
      where: { id: body.messageId, isDelete: false },
    });

    if (!message) {
      throw new DomainError(
        'MESSAGE_NOT_FOUND',
        `${body.messageId} xabari topilmadi`,
      );
    }

    if (message.senderId !== body.senderId) {
      throw new DomainError(
        'FORBIDDEN',
        "Faqat xabar muallifi uni o'chirishi mumkin",
      );
    }

    message.isDelete = true;
    await this.messages.save(message);

    return { messageId: message.id, conversationId: message.conversationId };
  }

  async getMessages(dto: GetMessagesDto) {
    const { conversationId, page, limit } = dto;

    const [messages, total] = await this.messages.findAndCount({
      where: { conversationId, isDelete: false },
      relations: { file: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: messages.reverse(),
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
