import { Controller, Inject } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { createMessageDTO } from './dto/createMessage';
import { MessagesService } from './messages.service';
import { chatGateway } from '../gateway/chat.gateway';
import { EditMessageDTO } from './dto/editMessage';
import { DeleteMessageDTO } from './dto/deleteMessage';

@Controller('messages')
export class MessagesController {
    constructor(
        private readonly MessagesService: MessagesService,
        private readonly chatGateway: chatGateway,
        @Inject('KAFKA_CLIENT') private clientKafka: ClientKafka
    ) { }


    @EventPattern('save_message_request')
    async createMessagePattern(@Payload() body: createMessageDTO) {
     
        const { receiverIds, savedMessage } = await this.MessagesService.saveMessage(body);
        this.chatGateway.sendToRoom(body.conservationId, "receive_message", {
            message: "Message yaratildi",
            savedMessage
        });

        this.clientKafka.emit("message_saved_success", {
            message: savedMessage,
            receivers: receiverIds
        })
    }



    @EventPattern('edit_message')
    async editMessagePattern(@Payload() body : EditMessageDTO){
        console.log("Yuklangan message ", body)
        return this.MessagesService.EditMessage(body);
    }

    @EventPattern("delete_message")
    async deleteMessagePattern(@Payload()  body : DeleteMessageDTO){
      return this.MessagesService.DeleteMessage(body)  
    }


    
}
