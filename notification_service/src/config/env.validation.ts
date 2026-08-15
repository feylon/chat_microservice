import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().port().default(3003),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: Joi.string().default('notification-service'),
  KAFKA_GROUP_ID: Joi.string().default('notification-service'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6380),
  NOTIFICATIONS_PER_USER: Joi.number().integer().min(1).default(50),
});

export const parseBrokers = (value: string | undefined): string[] =>
  (value ?? 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
