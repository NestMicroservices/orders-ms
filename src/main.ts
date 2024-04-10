import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('OrdersMS-Main');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  );

  await app.listen();
  logger.log(`Orders Microservice running on port ${envs.port}`);
}
bootstrap();
