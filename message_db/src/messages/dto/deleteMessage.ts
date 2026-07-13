import { isUUID, IsUUID } from "class-validator";

export class DeleteMessageDTO {
    
    @IsUUID()
    MessageId! : string

    @IsUUID()
    senderId! : string;

}