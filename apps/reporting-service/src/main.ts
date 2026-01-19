import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add health endpoint BEFORE any routing (NestJS + Express)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'reporting-service',
    });
  });

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Reporting & Analytics Service')
    .setDescription('Handles reporting, analytics, dashboards, and metrics for the professional practices platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Reports', 'Report generation and management')
    .addTag('Metrics', 'Metric tracking and analytics')
    .addTag('Dashboards', 'Dashboard creation and management')
    .addTag('Analytics', 'Advanced analytics and trend analysis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3008;
  await app.listen(port);
  console.log(`Reporting & Analytics Service is running on port ${port}`);
}

bootstrap();
