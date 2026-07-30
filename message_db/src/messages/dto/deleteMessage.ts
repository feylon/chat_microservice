import { IsUUID } from 'class-validator';

export class DeleteMessageDTO {
  @IsUUID()
  messageId!: string;

  @IsUUID()
  senderId!: string;
}
