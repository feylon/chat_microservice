import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SavedMessageDto {
  @IsString()
  id!: string;

  @IsString()
  conversationId!: string;

  @IsString()
  senderId!: string;

  @IsOptional()
  @IsString()
  content?: string | null;

  @IsOptional()
  @IsString()
  messageType?: string;

  @IsOptional()
  createdAt?: string;
}

export class MessageSavedEventDto {
  @IsObject()
  @ValidateNested()
  @Type(() => SavedMessageDto)
  message!: SavedMessageDto;

  @IsArray()
  @IsString({ each: true })
  receivers!: string[];
}
