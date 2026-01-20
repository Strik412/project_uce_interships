import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env['CORS_ORIGINS']?.split(',') || [
      'http://localhost:3000',
      'http://localhost:4200',
    ],
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('User Management Service')
    .setDescription('API para gestión de usuarios y perfiles')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 3002;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`User Management Service running on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error starting User Management Service:', err);
  process.exit(1);
});
