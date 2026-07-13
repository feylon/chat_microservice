import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, isString, IsUUID, ValidateNested } from "class-validator";

export class FileDTO {
    
    @IsString()
    fileName! : string

    @IsString()
    filePath!: string;

    @IsString()
    mimeType! : string;

    @IsInt()
    fileSize! : number;
}



export class createMessageDTO {
    @IsUUID()
    conservationId! : string;


    @IsUUID()
    senderId!:string;


    @IsUUID()
    receiverId!: string;

    @IsString()
    content! : string;

    @IsEnum(['text', 'file'])
    messageType!:'text' | 'file';

    @IsOptional()
    @ValidateNested()
    @Type(()=>FileDTO)
    file? : FileDTO;

}