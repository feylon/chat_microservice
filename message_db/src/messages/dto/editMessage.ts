import { IsString, isUUID, IsUUID } from "class-validator";

export class EditMessageDTO {
    @IsUUID()
    messageId!: string;

    @IsString()
    content!: string;

    @IsUUID()
    senderId!: string;

}