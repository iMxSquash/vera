/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') || 3000;
  const clientUrl = configService.get<string>('CLIENT_URL');
  const nodeEnv = configService.get<string>('NODE_ENV') || 'development';

  // CORS configuration for web app, extensions, and development
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests without origin (mobile apps, extensions, Postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow chrome extensions
      if (origin.startsWith('chrome-extension://')) {
        callback(null, true);
        return;
      }

      // Allow client URL
      if (origin === clientUrl) {
        callback(null, true);
        return;
      }

      // Allow localhost in development
      if (nodeEnv === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        callback(null, true);
        return;
      }

      // In production, be more restrictive
      if (nodeEnv === 'production') {
        if (origin.includes('vera')) {
          callback(null, true);
          return;
        }
      }

      callback(new Error('CORS policy: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  app.enableCors(corsOptions);

  // Set global route prefix
  app.setGlobalPrefix('api');

  // Add middleware for additional security headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Ensure CORS headers are set
    res.header('Access-Control-Allow-Private-Network', 'true');
    next();
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Vera API')
    .setDescription('API de vérification de faits - Plateforme Vera')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT'
    )
    .addTag('auth', 'Authentification')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/api/docs`);
}

bootstrap();
