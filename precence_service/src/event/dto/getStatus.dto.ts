import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class GetUserStatusDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
}

export class GetUsersStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  userIds!: string[];
}
