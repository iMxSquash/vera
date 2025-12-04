import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf, Context } from "telegraf";
import axios from "axios";

import { ContentsService, ContentPlatform } from "@vera/api/features/contents";
import { FactCheckService } from "@vera/api/features/fact-check";

const TIKTOK_REGEX =
  /(https?:\/\/)?(www\.)?tiktok\.com\/[^\s]+/gi;

@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly contentsService: ContentsService,
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

  // ------------------------------
  // /start
  // ------------------------------
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

  // ------------------------------
  // /help
  // ------------------------------
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
      const raw = message.text ?? "";
      const text = raw.replace("/verify", "").trim();

      if (!text) {
        return ctx.reply("❗ Utilisation : /verify <texte>");
      }

      const content = await this.contentsService.create({
        platform: ContentPlatform.TIKTOK, // Par défaut pour les vérifications texte
        url: '', // Pas d'URL pour les textes
        text: text,
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

  // ------------------------------
  // Texte simple ou Lien TikTok
  // ------------------------------
  private handleText() {
    this.bot.on("text", async (ctx) => {
      const message = ctx.message as { text: string };
      const text: string = message.text ?? "";

      const match = text.match(TIKTOK_REGEX);
      if (match) {
        const url = match[0];

        const content = await this.contentsService.create({
          platform: ContentPlatform.TIKTOK,
          url: url,
          text: text,
          metadata: {
            source: 'telegram_text',
            userId: ctx.from?.id,
            detectedUrl: true,
          },
        });

        const result = await this.factCheck.autoVerify(content.id);

        return ctx.reply(`🎬 TikTok détecté.\n✔ Vérification : ${result.status}`);
      }

      const content = await this.contentsService.create({
        platform: ContentPlatform.TIKTOK, // Par défaut pour les textes
        url: '', // Pas d'URL
        text: text,
        metadata: {
          source: 'telegram_text',
          userId: ctx.from?.id,
        },
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`📝 Résultat : ${result.status}`);
    });
  }

  // ------------------------------
  // Vidéo envoyée
  // ------------------------------
  private handleVideo() {
    this.bot.on("video", async (ctx) => {
      const message = ctx.message as { video: { file_id: string; mime_type?: string; file_name?: string; file_size?: number; duration?: number; width?: number; height?: number } };
      const video = message.video;

      if (!video || !video.file_id) {
        return ctx.reply("Aucune vidéo trouvée dans le message.");
      }

      const fileMeta = await ctx.telegram.getFile(video.file_id);

      const fileUrl = `https://api.telegram.org/file/bot${process.env['TELEGRAM_TOKEN']}/${fileMeta.file_path}`;

      const fileBuffer = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      const content = await this.contentsService.create({
        platform: ContentPlatform.TELEGRAM,
        url: fileUrl,
        text: undefined,
        media: {
          buffer: fileBuffer.data,
          mimeType: video.mime_type ?? "video/mp4",
          fileName: video.file_name ?? `video_${video.file_id}.mp4`,
        },
        metadata: {
          source: 'telegram_video',
          userId: ctx.from?.id,
          fileId: video.file_id,
          fileSize: video.file_size,
          duration: video.duration,
          width: video.width,
          height: video.height,
        },
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`🎥 Vidéo reçue.\n✔ Analyse : ${result.status}`);
    });
  }

  // ------------------------------
  // Photo envoyée
  // ------------------------------
  private handlePhoto() {
    this.bot.on("photo", async (ctx) => {
      const message = ctx.message as { photo: Array<{ file_id: string; file_size?: number; width?: number; height?: number }> };
      const photos = message.photo ?? [];

      if (!photos.length) {
        return ctx.reply("Aucune photo trouvée dans le message.");
      }

      const photo = photos[photos.length - 1]; // meilleure qualité

      if (!photo.file_id) {
        return ctx.reply("Impossible d'obtenir la photo.");
      }

      const fileMeta = await ctx.telegram.getFile(photo.file_id);

      const fileUrl = `https://api.telegram.org/file/bot${process.env['TELEGRAM_TOKEN']}/${fileMeta.file_path}`;

      const fileBuffer = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      const content = await this.contentsService.create({
        platform: ContentPlatform.TELEGRAM,
        url: fileUrl,
        text: undefined,
        media: {
          buffer: fileBuffer.data,
          mimeType: "image/jpeg",
          fileName: `photo_${photo.file_id}.jpg`,
        },
        metadata: {
          source: 'telegram_photo',
          userId: ctx.from?.id,
          fileId: photo.file_id,
          fileSize: photo.file_size,
          width: photo.width,
          height: photo.height,
        },
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`🖼 Photo analysée.\n✔ Résultat : ${result.status}`);
    });
  }
}