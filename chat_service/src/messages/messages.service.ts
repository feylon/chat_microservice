import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { lastValueFrom } from 'rxjs';
import { KAFKA_CLIENT } from '../clients.module';
import { DeleteMessageDto } from './dto/deleteMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { SendMessageDto } from './dto/sendMessage.dto';

export const TOPICS = {
  save: 'save_message_request',
  edit: 'edit_message',
  delete: 'delete_message',
} as const;

@Injectable()
export class MessagesService {
  constructor(@Inject(KAFKA_CLIENT) private readonly kafka: ClientKafka) {}

  async send(dto: SendMessageDto) {
    const conversationId = dto.conversationId ?? randomUUID();
    await lastValueFrom(
      this.kafka.emit(TOPICS.save, { ...dto, conversationId }),
    );
    return { status: 'queued', conversationId };
  }

  async edit(messageId: string, dto: EditMessageDto) {
    await lastValueFrom(this.kafka.emit(TOPICS.edit, { messageId, ...dto }));
    return { status: 'queued', messageId };
  }

  async remove(messageId: string, dto: DeleteMessageDto) {
    await lastValueFrom(this.kafka.emit(TOPICS.delete, { messageId, ...dto }));
    return { status: 'queued', messageId };
  }
}
