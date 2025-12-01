import { Update, Ctx, Start, Help } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { TelegramService } from './telegram.service';

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Bienvenue sur le bot Vérification !');
  }

  @Help()
  async help(@Ctx() ctx: Context) {
    await ctx.reply('Envoyez un lien TikTok ou Telegram pour vérifier un contenu.');
  }
}
