import { IsNotEmpty, IsString } from 'class-validator';

export class PresenceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
