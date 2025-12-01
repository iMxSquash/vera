import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { TelegramBotService } from "./telegram-bot.service";
import { ContentsModule } from "@vera/api/features/contents";
import { FactCheckModule } from "@vera/api/features/fact-check";

interface TelegrafConfig {
  token: string;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TelegrafConfig => {
        const token = config.get<string>("TELEGRAM_TOKEN");
        if (!token) {
          throw new Error("TELEGRAM_TOKEN environment variable is required");
        }
        return {
          token,
        };
      },
    }),

    ContentsModule,
    FactCheckModule,
  ],
  providers: [TelegramBotService],
})
export class TelegramModule {}