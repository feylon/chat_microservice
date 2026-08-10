import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator';

export class FileDto {
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

export class SendMessageDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsUUID()
  senderId!: string;

  @IsUUID()
  receiverId!: string;

  @ValidateIf((dto: SendMessageDto) => dto.messageType !== 'file' || dto.content !== undefined)
  @IsString()
  @MaxLength(4000)
  content?: string;

  @IsOptional()
  @IsIn(['text', 'file'])
  messageType: 'text' | 'file' = 'text';

  @ValidateIf((dto: SendMessageDto) => dto.messageType === 'file')
  @ValidateNested()
  @Type(() => FileDto)
  file?: FileDto;
}
