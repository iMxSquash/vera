import { Module } from "@nestjs/common";
import { TelegrafModule, TelegrafModuleOptions } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { TelegramBotService } from "./telegram-bot.service";
import { ContentsModule } from "@vera/api/features/contents";
import { FactCheckModule } from "@vera/api/features/fact-check";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TelegrafModuleOptions => ({
        token: config.get<string>("TELEGRAM_BOT_TOKEN") || "",
      }),
    }),

    ContentsModule,
    FactCheckModule,
  ],
  providers: [TelegramBotService],
})
export class TelegramModule {}
