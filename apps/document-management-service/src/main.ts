import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

const PORT = process.env['DOCUMENT_SERVICE_PORT'] || 3007;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // Prefijo global
  app.setGlobalPrefix('api/v1', { 
    exclude: ['health'],
  });
 
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
    .setTitle('Document Management Service')
    .setDescription('Service for managing documents and templates')
    .setVersion('1.0')
    .addTag('Documents')
    .addTag('Templates')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(PORT);

  console.log(`
    ════════════════════════════════════════════════════════════════
    📄 Document Management Service running on: http://localhost:${PORT}
    📚 Swagger Documentation: http://localhost:${PORT}/api
    ════════════════════════════════════════════════════════════════
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Document Management Service:', error);
  process.exit(1);
});
