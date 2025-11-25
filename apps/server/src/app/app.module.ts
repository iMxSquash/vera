import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@vera/api/features/auth';
import { FactCheckModule } from '@vera/api/features/fact-check';
import { SupabaseModule, TypeOrmConfigModule } from '@vera/api/shared/data-access';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmConfigModule,
    SupabaseModule,
    AuthModule,
    FactCheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
