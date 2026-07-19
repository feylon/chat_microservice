import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().port().default(3001),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().port().default(5433),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  DATABASE_LOGGING: Joi.boolean().default(false),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: Joi.string().default('message-storage'),
  KAFKA_GROUP_ID: Joi.string().default('message-storage'),
});

export const parseBrokers = (value: string | undefined): string[] =>
  (value ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
