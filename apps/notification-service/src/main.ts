import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

const PORT = process.env['NOTIFICATION_SERVICE_PORT'] || 3006;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Notification Service')
    .setDescription('Service for handling notifications and templates')
    .setVersion('1.0')
    .addTag('Notifications')
    .addTag('Templates')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);

  console.log(`
    ════════════════════════════════════════════════════════════════
    🔔 Notification Service running on: http://localhost:${PORT}
    📚 Swagger Documentation: http://localhost:${PORT}/api
    ════════════════════════════════════════════════════════════════
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Notification Service:', error);
  process.exit(1);
});
