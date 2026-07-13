import { IsString } from 'class-validator';

export class UserOnlineDto {
  @IsString()
  userId!: string;
}