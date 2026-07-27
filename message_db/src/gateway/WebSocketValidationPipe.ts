import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

const PRIMITIVES: unknown[] = [String, Boolean, Number, Array, Object];

@Injectable()
export class WebSocketValidationPipe implements PipeTransform<unknown> {
  async transform(value: unknown, { metatype, type }: ArgumentMetadata) {
    if (type !== 'body' || !metatype || PRIMITIVES.includes(metatype)) {
      return value;
    }

    let data = value;
    if (typeof value === 'string') {
      try {
        data = JSON.parse(value);
      } catch {
        throw new WsException("JSON formati noto'g'ri");
      }
    }

    const instance: object = plainToInstance(metatype, data ?? {});
    const errors = await validate(instance, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length > 0) {
      throw new WsException({
        message: 'Validatsiya xatosi',
        errors: errors.map((error) => ({
          field: error.property,
          constraints: error.constraints,
        })),
      });
    }

    return instance;
  }
}
