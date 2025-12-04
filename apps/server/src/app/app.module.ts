import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@vera/api/features/auth';
import { SupabaseModule } from '@vera/api/shared/data-access';
import { FactCheckModule } from '@vera/api/features/fact-check';
import { FeaturesInstagramPollsModule } from '@vera/api/features/instagram-polls';
import { ContentsModule } from '@vera/api/features/contents';
import { TelegramModule } from '@vera/api/features/bot';
import { FaceSwapModule } from '@vera/api/features/face-swap';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveyModule } from '@vera/api/features/survey';
import { GoogleSheetsService } from '@vera/api/features/survey';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Development only
        ssl: { rejectUnauthorized: false },
      }),
    }),
    SupabaseModule,
    AuthModule,
    FactCheckModule,
    FeaturesInstagramPollsModule,
    ContentsModule,
    TelegramModule,
    FaceSwapModule,
    SurveyModule,
  ],
  controllers: [],
  providers: [GoogleSheetsService],
})
export class AppModule {}
