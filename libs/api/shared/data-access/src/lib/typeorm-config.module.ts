import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { FactCheckEntity } from '@vera/api/features/fact-check';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        // Support for DATABASE_URL (Supabase format) or individual config
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [FactCheckEntity],
            synchronize: nodeEnv !== 'production',
            logging: configService.get<string>('DB_LOGGING') === 'true',
            ssl:
              nodeEnv === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        }

        // Fallback to individual DB credentials
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [FactCheckEntity],
          synchronize: nodeEnv !== 'production',
          logging: configService.get<string>('DB_LOGGING') === 'true',
          ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class TypeOrmConfigModule {}
