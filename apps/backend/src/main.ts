import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Récupérer ConfigService
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const backendUrl = configService.get<string>('BACKEND_URL');
  const port = configService.get<number>('PORT');

  // Configuration CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Vera API')
    .setDescription(
      'API REST pour la plateforme Vera - Fact-checking, sondages Instagram et extraction de contenus TikTok/Telegram'
    )
    .setVersion('1.0.0')
    .addServer(backendUrl, 'Production')
    .addServer('http://localhost:3000', 'Développement')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT'
    )
    .addTag('general', 'Endpoints généraux')
    .addTag('auth', 'Authentification des administrateurs')
    .addTag('fact-check', 'Module de fact-checking avec API Vera')
    .addTag('instagram-polls', 'Gestion des sondages Instagram')
    .addTag('contents', 'Gestion des contenus TikTok/Telegram')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: false,
      docExpansion: 'list',
    },
  });

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/${globalPrefix}/docs`
  );
  Logger.log(`🌐 CORS enabled for: ${frontendUrl}`);
}

bootstrap();
