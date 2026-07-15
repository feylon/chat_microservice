import { forwardRef, Inject, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { WebSocketValidationPipe } from "./WebSocketValidationPipe";
import { Server, Socket } from "socket.io";
import { ConversationsService } from "src/conversations/conversations.service";
import { GetConversationsDto } from "src/messages/dto/getConversationsDto";
import { GetMessagesDto, SchemaGetMessage } from "src/messages/dto/GetMessageSchema";
import { MessagesService } from "src/messages/messages.service";

@UsePipes(new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }))
@WebSocketGateway({ cors: "*" })
export class chatGateway {

    constructor(
        @Inject(forwardRef(() => ConversationsService)) private readonly ConversationsService: ConversationsService,
        @Inject(forwardRef(() => MessagesService)) private readonly messageService: MessagesService
    ) { }
    @WebSocketServer()
    server!: Server;

    sendToRoom(room: string, event: string, data: any) {
        this.server.to(room).emit(event, data);
    }

    @SubscribeMessage("join_room")
    handleJoinRoom(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {

        try {
            const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const roomId = data.data;
            client.join(roomId);
            console.log("Xonaga qo'shildi:", roomId);
        } catch (e) {
            console.error("JSON parsing error:", e);
        }
    }


    sendToClient(clientId: string, event: string, data: any) {
        this.server.to(clientId).emit(event, data);
    }

    sendToClientError_notification(clientId: string, data: any) {
        this.server.to(clientId).emit('error_notification', data);
    }



    @UsePipes(new WebSocketValidationPipe())
    @SubscribeMessage("get_conversations")
    async Handle_Get_Conversations(
        @MessageBody() body: string,
        @ConnectedSocket() client: Socket
    ) {
        console.log("Belgilangan", body)
        const parsedBody = JSON.parse(body)
        const conservartions = await this.ConversationsService.getUserConversations(parsedBody);

        console.log("Xabar keldi");
        client.emit("conversations_list", conservartions);
    }


    @SubscribeMessage("get_messages")
    async handleGetMessages(
        @MessageBody() data: GetMessagesDto,
        @ConnectedSocket() client: Socket
    ) {
        const messages = await this.messageService.getMessages(data);

        client.emit("messages_list", messages);
    }
}