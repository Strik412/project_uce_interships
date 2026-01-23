import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow browser calls from the Next.js dev server
  app.enableCors({
    origin: ['http://localhost:3000'],
  });

  // Prefijo global (except /health for gateway health checks)
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('API de autenticación y autorización')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Auth Service running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap().catch(err => {
  console.error('Error starting Auth Service:', err);
  process.exit(1);
});
