import { Injectable } from "@nestjs/common";
import { Ctx, Help, On, Start, Update, Command } from "nestjs-telegraf";
import { Context } from "telegraf";
import axios from "axios";

import { ContentsService } from "../contents/contents.service";
import { FactCheckService } from "../../../fact-check/src/lib/fact-check.service";

const TIKTOK_REGEX =
  /(https?:\/\/)?(www\.)?tiktok\.com\/[^\s]+/gi;

@Update()
@Injectable()
export class TelegramBotService {
  constructor(
    private readonly contentsService: ContentsService,
    private readonly factCheck: FactCheckService,
  ) {}

  // --------------------------
  // /start
  // --------------------------
  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply(
      "👋 Bienvenue !\n\n" +
        "Je suis le bot de vérification automatique de Vera.\n" +
        "Envoyez-moi un texte, une vidéo ou un lien TikTok pour vérifier son authenticité.\n\n" +
        "Commandes disponibles :\n" +
        "/verify <texte>\n/help"
    );
  }

  // --------------------------
  // /help
  // --------------------------
  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(
      "📌 Voici les commandes :\n\n" +
        "/start – présentation\n" +
        "/verify <texte> – vérifier une affirmation\n" +
        "Envoyez simplement un texte, une photo, une vidéo ou un lien TikTok."
    );
  }

  // --------------------------
  // /verify <texte>
  // --------------------------
  @Command("verify")
  async verifyCommand(@Ctx() ctx: any) {
    const text = ctx.message.text.replace("/verify", "").trim();

    if (!text) {
      return ctx.reply("❗ Utilisation : /verify <texte>");
    }

    // Stockage dans DB
    const content = await this.contentsService.create({
      type: "text",
      value: text,
      source: "telegram",
    });

    // Auto vérification
    const result = await this.factCheck.autoVerify(content.id);

    return ctx.reply(`✔ Résultat : ${result.status}`);
  }

  // --------------------------
  // Texte libre envoyé par l'utilisateur
  // --------------------------
  @On("text")
  async handleText(@Ctx() ctx: any) {
    const text = ctx.message.text;

    // 1. Détection de lien TikTok
    const tiktokMatch = text.match(TIKTOK_REGEX);

    if (tiktokMatch) {
      const url = tiktokMatch[0];

      const content = await this.contentsService.create({
        type: "video_url",
        value: url,
        source: "telegram",
      });

      const result = await this.factCheck.autoVerify(content.id);

      return ctx.reply(`🎬 TikTok détecté.\n✔ Vérification : ${result.status}`);
    }

    // 2. Texte normal → vérification directe
    const content = await this.contentsService.create({
      type: "text",
      value: text,
      source: "telegram",
    });

    const result = await this.factCheck.autoVerify(content.id);

    return ctx.reply(`📝 Résultat : ${result.status}`);
  }

  // --------------------------
  // Réception de vidéos
  // --------------------------
  @On("video")
  async handleVideo(@Ctx() ctx: any) {
    const video = ctx.message.video;
    const fileId = video.file_id;

    const file = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;

    const fileBuffer = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    // Stockage
    const content = await this.contentsService.create({
      type: "video",
      value: fileBuffer.data,
      source: "telegram",
      mimeType: video.mime_type,
    });

    // Auto-vérification
    const result = await this.factCheck.autoVerify(content.id);

    return ctx.reply(`🎥 Vidéo reçue.\n✔ Analyse : ${result.status}`);
  }

  // --------------------------
  // Réception de photos
  // --------------------------
  @On("photo")
  async handlePhoto(@Ctx() ctx: any) {
    const photo = ctx.message.photo.pop(); // meilleure résolution
    const fileId = photo.file_id;

    const file = await ctx.telegram.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file.file_path}`;

    const fileBuffer = await axios.get(url, {
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
  }
}
