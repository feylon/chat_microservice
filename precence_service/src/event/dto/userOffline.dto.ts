import { IsNotEmpty, IsString } from 'class-validator';

export class UserOfflineDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
