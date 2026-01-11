import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // CORS
  app.enableCors({
    origin: (process.env['CORS_ORIGINS'] || 'http://localhost:3000').split(','),
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Registration Service API')
    .setDescription('Prácticas, aplicaciones y asignaciones')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env['PORT'] || 3003;
  await app.listen(port);
  console.log(`🚀 Registration Service running on http://localhost:${port}`);
}

bootstrap();
