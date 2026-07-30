import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class EditMessageDTO {
  @IsUUID()
  messageId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;

  @IsUUID()
  senderId!: string;
}
