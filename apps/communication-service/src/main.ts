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
    .setTitle('Communication Service API')
    .setDescription('Messaging, conversations, and communication management')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:3005', 'Development')
    .addServer(process.env.API_URL || 'http://localhost:3005', 'Production')
    .addTag('Messages', 'Message management')
    .addTag('Conversations', 'Conversation management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3005;
  await app.listen(port, '0.0.0.0');

  console.log(`Communication Service running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}

bootstrap().catch(error => {
  console.error('Error starting Communication Service:', error);
  process.exit(1);
});
