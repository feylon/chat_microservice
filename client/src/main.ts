import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log("3001 portda ishga tushdi ")
  await app.listen( 3010);
}
bootstrap();
