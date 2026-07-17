import { Delete, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from './entity/messages';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createMessageDTO } from './dto/createMessage';
import { ConversationEntity } from '../conversations/entity/conversations';
import { dot } from 'node:test/reporters';
import { EditMessageDTO } from './dto/editMessage';
import { chatGateway } from '../gateway/chat.gateway';
import { DeleteMessageDTO as DeleteMessage } from './dto/deleteMessage';
import { GetConversationsDto } from './dto/getConversationsDto';
import { GetMessagesDto } from './dto/GetMessageSchema';

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity) private message: Repository<MessageEntity>,
        private dataSource: DataSource,
        private readonly chatGateway: chatGateway,

    ) { }


    async saveMessage(body: createMessageDTO) {

        return this.dataSource.transaction(async (manager) => {
            let conversation = await manager.findOne(ConversationEntity, {
                where: { id: body.conservationId }
            });

            if (!conversation) {
                conversation = manager.create(ConversationEntity, {
                    id: body.conservationId,
                    participants: [body.senderId, body.receiverId]
                });
            } else if (!conversation.participants.includes(body.senderId)) {
                conversation.participants.push(body.senderId);
                await manager.save(conversation);
            }

            // 2
            const message = manager.create(MessageEntity, {
                conversationId: body.conservationId,
                senderId: body.senderId,
                content: body.content,
                messageType: body.messageType,
                // file : body.file || null
            });
            const savedMessage = await manager.save((message));
            const receiverIds = conversation.participants.filter(id => id !== body.senderId);


            return { savedMessage, receiverIds };

        })

    }


    async EditMessage(body: EditMessageDTO) {
        try {
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const message = await this.message.findOne({
                where:
                {
                    id: body.messageId,
                    isDelete: false
                },
                relations: {
                    conversation: true
                }
            });
            if (!message) {
                this.chatGateway.sendToClientError_notification(body.senderId, {
                    message: `${body.messageId} xabari topilmadi`
                });
                return;
            }

            const now = new Date();
            const createdAt = new Date(message?.createdAt);
            const dfTime = now.getTime() - createdAt.getTime();
            if (dfTime > ONE_DAY_MS) {
                return this.chatGateway.sendToClientError_notification(body.senderId, {
                    message: `Tahrirlash vaqti 1 sutkadan o'tib ketdi.(MessageID : ${body.messageId})`
                });
            }

            message.content = body.content;

            const savedMessage = await this.message.save(message);
            const conservationId = message.conversation.id;
            return this.chatGateway.server.to(conservationId).emit("message_update", {
                messageId: savedMessage.id,
                newContent: savedMessage.content,
                isEdited: true,
                updatedAt: savedMessage.updatedAt
            });
        } catch (error) {
            console.error("EditMessage xatoligi:", error);

            this.chatGateway.sendToClientError_notification(body.senderId, {
                message: "Xabarni tahrirlashda texnik xatolik yuz berdi."
            });
        }
    }


    async DeleteMessage(body: DeleteMessage) {
        try {
            const { MessageId, senderId } = body;

            const foundMessage = await this.message.findOne({
                where: {
                    id: MessageId,
                    isDelete: false,
                    senderId: senderId
                },
                relations: {
                    conversation: true
                },


            });


            if (foundMessage?.senderId == senderId) {
                const conservationId = foundMessage.conversation.id;
                const messageId = foundMessage.id;
                foundMessage.isDelete = true
                await this.message.save(foundMessage);

                return this.chatGateway.server.to(conservationId).emit("delete_message", {
                    messageId,
                    isDeleted: true
                })
            }


        } catch (error) {
            console.log("Xabarni o'chirishda xatolik yuz berdi ")
        }
    }


    async getMessages(dto: GetMessagesDto) {
        const { conversationId, page, limit } = dto;
        const skip = (page - 1) * limit;

        const [messages, total] = await this.message.findAndCount({
            where: {
                conversationId: conversationId,
                isDelete: false
            },
            order: {
                createdAt: 'DESC'
            },
            skip,
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
