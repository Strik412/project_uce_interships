import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/filters/http-exception.filter';
import { LoggingInterceptor } from './app/interceptors/logging.interceptor';
import { TransformInterceptor } from './app/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') || [
      'http://localhost:3000',
      'http://localhost:4200',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Prefijo global
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

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('Central API Gateway for Prácticas Profesionales Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('gateway', 'Gateway endpoints')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env['PORT'] || 4000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 API Gateway running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
  console.log(`\n📍 Service Routing:`);
  console.log(`   /api/v1/auth/*         → Auth Service (3001)`);
  console.log(`   /api/v1/users/*        → User Management Service (3002)`);
  console.log(`   /api/v1/practices/*    → Registration Service (3003)`);
  console.log(`   /api/v1/progress/*     → Tracking Service (3004)`);
  console.log(`   /api/v1/milestones/*   → Tracking Service (3004)`);
  console.log(`   /api/v1/assignments/*  → Tracking Service (3004)`);
  console.log(`   /api/v1/messages/*     → Communication Service (3005)`);
  console.log(`   /api/v1/conversations/* → Communication Service (3005)`);
  console.log(`   /api/v1/notifications/* → Notification Service (3006)`);
  console.log(`   /api/v1/templates/*    → Notification Service (3006)`);
  console.log(`   /api/v1/documents/*    → Document Management Service (3007)`);
  console.log(`   /api/v1/reports/*      → Reporting & Analytics Service (3008)`);
  console.log(`   /api/v1/metrics/*      → Reporting & Analytics Service (3008)`);
  console.log(`   /api/v1/dashboards/*   → Reporting & Analytics Service (3008)`);
  console.log(`   /api/v1/analytics/*    → Reporting & Analytics Service (3008)`);
}

bootstrap().catch(err => {
  console.error('❌ Error starting API Gateway:', err);
  process.exit(1);
});


