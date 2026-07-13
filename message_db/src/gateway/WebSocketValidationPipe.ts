import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WebSocketValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
     
    let data = value;
    if (typeof value === 'string') {
      try {
        data = JSON.parse(value);
      } catch (e) {
        throw new WsException('Invalid JSON format');
      }
    }

    
    if (!metatype || this.toValidate(metatype)) {
      return data;
    }

     
    const object = plainToInstance(metatype, data);
    
    
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new WsException(errors);  
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return types.includes(metatype);
  }
}