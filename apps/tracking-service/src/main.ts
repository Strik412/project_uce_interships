import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['debug', 'error', 'log', 'warn'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });
  
  // Global validation pipe
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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tracking Service API')
    .setDescription('Practice tracking, progress reports, and milestone management')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:3004', 'Development')
    .addServer(process.env.API_URL || 'http://localhost:3004', 'Production')
    .addTag('Assignments', 'Practice assignment management')
    .addTag('Progress', 'Weekly progress reports and reviews')
    .addTag('Milestones', 'Milestone and deliverable tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3004;
  await app.listen(port, '0.0.0.0');

  console.log(`Tracking Service running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}

bootstrap().catch(error => {
  console.error('Error starting Tracking Service:', error);
  process.exit(1);
});
