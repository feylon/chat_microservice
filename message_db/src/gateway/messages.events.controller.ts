import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { DomainError } from '../common/domain.error';
import { KAFKA_CLIENT } from '../kafka/kafka.module';
import { CreateMessageDTO } from '../messages/dto/createMessage';
import { DeleteMessageDTO } from '../messages/dto/deleteMessage';
import { EditMessageDTO } from '../messages/dto/editMessage';
import { MessagesService } from '../messages/messages.service';
import { ChatGateway } from './chat.gateway';

@Controller()
export class MessagesEventsController {
  private readonly logger = new Logger(MessagesEventsController.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly gateway: ChatGateway,
    @Inject(KAFKA_CLIENT) private readonly kafka: ClientKafka,
  ) {}

  @EventPattern('save_message_request')
  async onSaveMessage(@Payload() body: CreateMessageDTO) {
    await this.handle(body.senderId, async () => {
      const { savedMessage, receiverIds } =
        await this.messagesService.saveMessage(body);

      this.gateway.sendToRoom(
        body.conversationId,
        'receive_message',
        savedMessage,
      );
      for (const receiverId of receiverIds) {
        this.gateway.sendToUser(receiverId, 'new_message', savedMessage);
      }

      this.kafka.emit('message_saved_success', {
        message: savedMessage,
        receivers: receiverIds,
      });
    });
  }

  @EventPattern('edit_message')
  async onEditMessage(@Payload() body: EditMessageDTO) {
    await this.handle(body.senderId, async () => {
      const message = await this.messagesService.editMessage(body);
      this.gateway.sendToRoom(message.conversationId, 'message_update', {
        messageId: message.id,
        newContent: message.content,
        isEdited: true,
        updatedAt: message.updatedAt,
      });
    });
  }

  @EventPattern('delete_message')
  async onDeleteMessage(@Payload() body: DeleteMessageDTO) {
    await this.handle(body.senderId, async () => {
      const { messageId, conversationId } =
        await this.messagesService.deleteMessage(body);
      this.gateway.sendToRoom(conversationId, 'delete_message', {
        messageId,
        isDeleted: true,
      });
    });
  }

  private async handle(senderId: string, action: () => Promise<void>) {
    try {
      await action();
    } catch (error) {
      if (error instanceof DomainError) {
        this.gateway.sendError(senderId, {
          code: error.code,
          message: error.message,
        });
        return;
      }
      this.logger.error(
        'Kafka hodisasini qayta ishlashda xatolik',
        error instanceof Error ? error.stack : error,
      );
      this.gateway.sendError(senderId, {
        code: 'INTERNAL_ERROR',
        message: 'Texnik xatolik yuz berdi',
      });
    }
  }
}
