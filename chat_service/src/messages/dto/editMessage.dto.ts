import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class EditMessageDto {
  @IsUUID()
  senderId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content!: string;
}
