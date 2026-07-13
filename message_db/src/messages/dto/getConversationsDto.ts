import { IsUUID } from "class-validator";

export class GetConversationsDto {
    page : number = 1;
    limit : number = 10;

    @IsUUID()
    userId! : string;
}