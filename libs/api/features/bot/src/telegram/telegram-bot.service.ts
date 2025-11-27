import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf, Context } from "telegraf";
import axios from "axios";

import { ContentsService } from "../contents/contents.service";
import { FactCheckService } from "../../../fact-check/src/lib/fact-check.service";

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

  // ------------------------------
  // /verify <texte>
  // ------------------------------
  private handleVerifyCommand() {
    this.bot.command("verify", async (ctx) => {
      const text = (ctx.message && (ctx.message as any).text) ? (ctx.message as any).text.replace("/verify", "").trim() : "";

      if (!text) {
        return ctx.reply("❗ Utilisation : /verify <texte>");
      }

      const content = await this.contentsService.create({
        type: "text",
        value: text,
        source: "telegram",
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`✔ Résultat : ${result.status}`);
    });
  }

  // ------------------------------
  // Texte simple
  // ------------------------------
  private handleText() {
    this.bot.on("text", async (ctx) => {
      const text = (ctx.message && (ctx.message as any).text) ? (ctx.message as any).text : "";

      const match = text.match(TIKTOK_REGEX);
      if (match) {
        const url = match[0];

        const content = await this.contentsService.create({
          type: "video_url",
          value: url,
          source: "telegram",
        });

        const result = await this.factCheck.autoVerify(content.id);

        return ctx.reply(`🎬 TikTok détecté.\n✔ Vérification : ${result.status}`);
      }

      const content = await this.contentsService.create({
        type: "text",
        value: text,
        source: "telegram",
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
      // safe cast pour éviter les erreurs de typage
      const messageAny = ctx.message as any;
      const video = messageAny && messageAny.video ? messageAny.video : null;

      if (!video) {
        return ctx.reply("Aucune vidéo trouvée dans le message.");
      }

      const fileMeta = await ctx.telegram.getFile(video.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${fileMeta.file_path}`;

      const fileBuffer = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      const content = await this.contentsService.create({
        type: "video",
        value: fileBuffer.data,
        source: "telegram",
        mimeType: video.mime_type,
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
      // safe cast pour éviter les erreurs de typage
      const messageAny = ctx.message as any;
      const photos: any[] = messageAny && messageAny.photo ? messageAny.photo : [];

      if (!photos.length) {
        return ctx.reply("Aucune photo trouvée dans le message.");
      }

      // récupère la meilleure résolution (dernier élément)
      const photo = photos.pop();

      if (!photo || !photo.file_id) {
        return ctx.reply("Impossible d'obtenir la photo.");
      }

      const fileMeta = await ctx.telegram.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${fileMeta.file_path}`;

      const fileBuffer = await axios.get(fileUrl, {
        responseType: "arraybuffer",
      });

      const content = await this.contentsService.create({
        type: "image",
        value: fileBuffer.data,
        source: "telegram",
        mimeType: "image/jpeg",
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`🖼 Photo analysée.\n✔ Résultat : ${result.status}`);
    });
  }
}
