import * as Joi from 'joi';
export const SchemaGetMessage = Joi.object({
    conversationId : Joi.string().uuid().required(),
    page : Joi.number().required().min(0).integer(),
    limit : Joi.number().required().integer().min(0)
});

export class GetMessagesDto {
  conversationId!: string;
  page: number = 1;
  limit: number = 50; // Odatda xabarlar ro'yxati uzunroq bo'ladi
}