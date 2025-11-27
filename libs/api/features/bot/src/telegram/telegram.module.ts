import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { TelegramBotService } from "./telegram-bot.service";
import { ContentsModule } from "../contents/contents.module";
import { FactCheckModule } from "../../../fact-check/src/lib/fact-check.module";

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_TOKEN,
    }),
    ContentsModule,
    FactCheckModule,
  ],
  providers: [TelegramBotService],
})
export class TelegramModule {}
