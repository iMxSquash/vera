import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf, Context } from "telegraf";
import axios from "axios";

import { TelegramService, ContentPlatform } from "@vera/api/features/contents";
import { FactCheckService } from "@vera/api/features/fact-check";

const TIKTOK_REGEX = /(https?:\/\/)?(www\.)?tiktok\.com\/[^\s]+/gi;

@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly contentsService: TelegramService,
    private readonly factCheck: FactCheckService,
  ) {}

  onModuleInit() {
    this.handleStart();
    this.handleHelp();
    this.handleVerifyCommand();
    this.handleText();
    this.handleVideo();
    this.handlePhoto();
  }

  private handleStart() {
    this.bot.start(async (ctx) => {
      await ctx.reply(
        "👋 Bienvenue !\n\n" +
        "Je suis le bot de vérification automatique de Vera.\n" +
        "Envoyez-moi un texte, une vidéo ou un lien TikTok pour vérifier son authenticité.\n\n" +
        "Commandes :\n" +
        "/verify <texte>\n/help"
      );
    });
  }

  private handleHelp() {
    this.bot.help(async (ctx) => {
      await ctx.reply(
        "📌 Commandes disponibles :\n\n" +
        "/start – présentation\n" +
        "/verify <texte> – vérifier une affirmation\n" +
        "Ou envoyez simplement un texte, vidéo, photo ou lien TikTok."
      );
    });
  }

  private handleVerifyCommand() {
    this.bot.command("verify", async (ctx) => {
      const message = ctx.message as { text: string };
      const text = (message.text ?? "").replace("/verify", "").trim();

      if (!text) {
        return ctx.reply("❗ Utilisation : /verify <texte>");
      }

      const content = await this.contentsService.create({
        platform: ContentPlatform.TIKTOK,
        url: '',
        text,
        metadata: {
          source: 'telegram_command',
          userId: ctx.from?.id,
          command: 'verify',
        },
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`✔ Résultat : ${result.status}`);
    });
  }

  private handleText() {
    this.bot.on("text", async (ctx) => {
      const message = ctx.message as { text: string };
      const text = message.text ?? "";

      const match = text.match(TIKTOK_REGEX);
      const url = match ? match[0] : '';

      const content = await this.contentsService.create({
        platform: match ? ContentPlatform.TIKTOK : ContentPlatform.TELEGRAM,
        url,
        text: text || undefined,
        media: undefined,
        metadata: {
          source: 'telegram_text',
          userId: ctx.from?.id,
          detectedUrl: !!match,
        },
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`📝 Résultat : ${result.status}`);
    });
  }

  // -----------------------------
  // Handle video messages
  // -----------------------------
  private handleVideo() {
    this.bot.on("video", async (ctx) => {
      const message = ctx.message as { video: { file_id: string }; caption?: string };
      const video = message.video;
      const caption = message.caption ?? '';

      if (!video) return;

      const content = await this.contentsService.create({
        platform: ContentPlatform.TELEGRAM,
        url: '', // Telegram n'a pas d'URL directe
        text: caption || undefined,
        media: { file_id: video.file_id },
        metadata: {
          source: 'telegram_video',
          userId: ctx.from?.id,
        },
      });

      const result = await this.factCheck.autoVerify(content.id);
      await ctx.reply(`🎬 Vidéo reçue – Résultat : ${result.status}`);
    });
  }

  // -----------------------------
  // Handle photo messages
  // -----------------------------
  private handlePhoto() {
    this.bot.on("photo", async (ctx) => {
      const message = ctx.message as { photo: Array<{ file_id: string }>; caption?: string };
      const photos = message.photo ?? [];
      const caption = message.caption ?? '';

      if (!photos.length) return;

      const largestPhoto = photos[photos.length - 1];

      const content = await this.contentsService.create({
        platform: ContentPlatform.TELEGRAM,
        url: '', // Telegram n'a pas d'URL directe
        text: caption || undefined,
        media: { file_id: largestPhoto.file_id },
        metadata: {
          source: 'telegram_photo',
          userId: ctx.from?.id,
        },
      });

      const result = await this.factCheck.autoVerify(content.id);
      await ctx.reply(`📷 Photo reçue – Résultat : ${result.status}`);
    });
  }
}
