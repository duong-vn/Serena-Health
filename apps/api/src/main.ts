import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:5173').trim().replace(/\/$/, '');
  const origins = (process.env.CORS_ORIGINS ?? frontendUrl)
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  if (!origins.includes(frontendUrl)) origins.push(frontendUrl);
  app.enableCors({ origin: origins, credentials: true });

  const swaggerConfig = new DocumentBuilder().setTitle('Serene Health API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, swaggerConfig));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger at http://localhost:${port}/api/docs`);
}

bootstrap();
