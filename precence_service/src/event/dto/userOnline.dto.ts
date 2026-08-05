import { IsNotEmpty, IsString } from 'class-validator';

export class UserOnlineDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
