import { IsString } from 'class-validator';

export class UserOfflineDto {
  @IsString()
  userId!: string;
}