import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator';

export class FileDTO {
  @IsString()
  fileName!: string;

  @IsString()
  filePath!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(0)
  fileSize!: number;
}

export class CreateMessageDTO {
  @IsUUID()
  conversationId!: string;

  @IsUUID()
  senderId!: string;

  @IsUUID()
  receiverId!: string;

  @ValidateIf((dto: CreateMessageDTO) => dto.messageType === 'text' || dto.content !== undefined)
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsIn(['text', 'file'])
  messageType: 'text' | 'file' = 'text';

  @ValidateIf((dto: CreateMessageDTO) => dto.messageType === 'file')
  @ValidateNested()
  @Type(() => FileDTO)
  file?: FileDTO;
}
