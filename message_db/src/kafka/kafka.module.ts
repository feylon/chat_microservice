import { Global, Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Global() 
@Module({
  imports: [
       ClientsModule.register([
         {
           name: "KAFKA_CLIENT",
           transport: Transport.KAFKA,
           options: {
             client: {
               brokers: ['localhost:9092'],
             },
             consumer: { groupId: 'gateway-consumer' }
           }
         }
       ])
  ],
  exports: [ClientsModule] // Eksport qilish shart!
})
export class KafkaModule {}