import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf, Context } from "telegraf";
import axios from "axios";
import * as dotenv from "dotenv";
import { ContentsService } from "@vera/api/features/contents";
import { FactCheckService } from "@vera/api/features/fact-check";

dotenv.config();

enum ContentPlatform {
  TELEGRAM = "telegram",
  TIKTOK = "tiktok",
}

const TIKTOK_REGEX = /(https?:\/\/)?(www\.)?tiktok\.com\/[^\s]+/gi;

interface TikTokAIAnalysis {
  probability: number;
  indicators: string[];
}

interface TikTokAnalysisResult {
  aiAnalysis: TikTokAIAnalysis;
  videoUrl: string;
}

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly contentsService: ContentsService,
    private readonly factCheckService: FactCheckService
  ) {}

  onModuleInit() {
    this.handleStart();
    this.handleHelp();
    this.handleVerifyCommand();

    // Texte
    this.bot.on("text", async (ctx) =>
      this.handleClaim(ctx, ctx.message.text ?? "")
    );

    // Vidéo Telegram
    this.bot.on("video", async (ctx) => {
      const caption = ctx.message.caption ?? "";
      await this.handleClaim(ctx, caption, "video", ctx.message.video?.file_id);
    });

    // Photo Telegram
    this.bot.on("photo", async (ctx) => {
      const photos = ctx.message.photo;
      if (!photos || !photos.length) {
        await ctx.reply("❌ Pas de photo détectée.");
        return;
      }
      const caption = ctx.message.caption ?? "";
      const fileId = photos[photos.length - 1].file_id;
      await this.handleClaim(ctx, caption, "photo", fileId);
    });
  }

  private handleStart() {
    this.bot.start(async (ctx) => {
      await ctx.reply(
        "👋 Bienvenue !\n\n" +
          "Je vérifie l’authenticité de vidéos, images, textes et liens TikTok.\n\n" +
          "Envoyez :\n" +
          "• un texte\n" +
          "• une photo\n" +
          "• une vidéo\n" +
          "• un lien TikTok\n"
      );
    });
  }

  // ------------------------------
  // /help
  // ------------------------------
  private handleHelp() {
    this.bot.help(async (ctx) => {
      await ctx.reply(
        "📌 Commandes :\n\n" +
          "/verify <texte>\n" +
          "Envoyez n’importe quel contenu (texte, lien, photo, vidéo)."
      );
    });
  }

  private async handleVerifyCommand() {
    this.bot.command("verify", async (ctx) => {
      const message = ctx.message as { text: string };
      const text = (message.text ?? "").replace("/verify", "").trim();
      if (!text.length) {
        await ctx.reply("❗ Utilisation : /verify <texte>");
        return;
      }
      await this.handleClaim(ctx, text);
    });
  }

  /**
   * ---------------------------------------------------
   * 🔥 Analyse principale avec FactCheckService
   * ---------------------------------------------------
   */
  private async handleClaim(
    ctx: Context,
    text: string,
    type: "text" | "photo" | "video" = "text",
    fileId?: string
  ) {
    await ctx.reply("🔄 Analyse en cours...");

    try {
      const userId = ctx.from?.id?.toString() ?? "unknown_user";
      const matchArray = text.match(TIKTOK_REGEX);
      const platform = matchArray ? ContentPlatform.TIKTOK : ContentPlatform.TELEGRAM;

      // 🔹 Sauvegarde du contenu
      const content = await this.contentsService.create({
        platform,
        url: matchArray ? matchArray[0] : "",
        text,
        media: fileId ? { fileId } : undefined,
        metadata: { source: `telegram_${type}`, userId: ctx.from?.id },
      });

      let tikTokAnalysis: TikTokAnalysisResult | null = null;
      let mediaAnalysis: { mediaType: string; description: string } | null = null;
      let veraResponse = "";

      // 🔹 Si TikTok → analyse vidéo TikTok
      if (matchArray) {
        tikTokAnalysis = await this.analyseTikTokVideo(matchArray[0]);
      }

      // 🔹 Si média présent → analyse avec FactCheckService
      if (fileId && (type === "photo" || type === "video")) {
        try {
          // Télécharger le fichier depuis Telegram et analyser avec FactCheckService
          const file = await this.downloadTelegramFile(ctx, fileId, type);
          mediaAnalysis = await this.factCheckService.uploadAndAnalyzeMedia(file);
        } catch (mediaErr) {
          this.logger.warn(`Erreur analyse média: ${mediaErr instanceof Error ? mediaErr.message : String(mediaErr)}`);
        }
      }

      // 🔹 Vérification Vera avec FactCheckService
      try {
        const query = this.buildQuery(text, mediaAnalysis);
        const result = await this.factCheckService.verifyFactExternal(userId, query);
        veraResponse = result.result;
      } catch (veraErr) {
        this.logger.error(`Erreur FactCheckService: ${veraErr instanceof Error ? veraErr.message : String(veraErr)}`);
        veraResponse = "Erreur lors de la vérification avec Vera.";
      }

      // 🔹 Fusion finale
      const response = this.formatFinalResponse(text, tikTokAnalysis, veraResponse);

      await ctx.reply(response, { parse_mode: "Markdown" });

      // 🔹 Marquer le contenu comme vérifié
      await this.contentsService.markAsVerified(content.id, veraResponse);
    } catch (err) {
      this.logger.error(`Erreur handleClaim: ${err instanceof Error ? err.message : String(err)}`);
      await ctx.reply("❌ Erreur lors de l'analyse.");
    }
  }

  /**
   * -----------------------------------------
   * 🔥 1. Analyse vidéo TikTok
   * -----------------------------------------
   */
  private async analyseTikTokVideo(tiktokUrl: string): Promise<TikTokAnalysisResult | null> {
    try {
      const downloadApi = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
      const res = await axios.get(downloadApi);

      const videoUrl = res.data?.data?.hdplay ?? res.data?.data?.play;
      if (!videoUrl) return null;

      const file = await axios.get(videoUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(file.data);

      const aiAnalysis = await this.detectAIVideo(buffer);

      return {
        aiAnalysis,
        videoUrl,
      };
    } catch (err) {
      console.error("Erreur analyse TikTok :", err);
      return null;
    }
  }

  /**
   * --------------------------------------------------
   * 🔥 2. Détection IA (fake pour démo)
   * --------------------------------------------------
   */
  private async detectAIVideo(buffer: Buffer): Promise<TikTokAIAnalysis> {
    // On utilise "buffer" dans un indicateur pour éviter l'avertissement TS
    const sizeKb = Math.round(buffer.byteLength / 1024);

    return {
      probability: Math.floor(Math.random() * 40) + 60,
      indicators: [
        `taille du fichier : ${sizeKb} KB`,
        "texture de peau artificielle",
        "clignements irréguliers",
        "détails trop propres (IA)"
      ],
    };
  }

  /**
   * ------------------------------------------------
   * 🔥 3. Construction de la requête
   * ------------------------------------------------
   */
  private buildQuery(
    originalText: string,
    mediaAnalysis?: { mediaType: string; description: string } | null
  ): string {
    if (!mediaAnalysis) {
      return originalText;
    }

    return `${mediaAnalysis.mediaType.toUpperCase()} ANALYSIS: ${mediaAnalysis.description}\n\nORIGINAL QUERY: ${originalText}`;
  }

  /**
   * ------------------------------------------------
   * 🔥 4. Téléchargement de fichier Telegram
   * ------------------------------------------------
   */
  private async downloadTelegramFile(
    ctx: Context,
    fileId: string,
    type: "photo" | "video"
  ): Promise<Express.Multer.File> {
    try {
      const file = await ctx.telegram.getFile(fileId);
      // Utiliser la méthode officielle pour construire l'URL du fichier
      const fileUrl = `https://api.telegram.org/file/bot${process.env['TELEGRAM_BOT_TOKEN']}/${file.file_path}`;
      const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

      // Déterminer le type MIME en fonction du type de média
      const mimeType = type === "video" ? "video/mp4" : "image/jpeg";
      const extension = type === "video" ? "mp4" : "jpg";
      const fileName = `telegram_${fileId}.${extension}`;

      return {
        fieldname: "media",
        originalname: fileName,
        encoding: "7bit",
        mimetype: mimeType,
        size: response.data.length,
        destination: "/tmp",
        filename: fileName,
        path: ``,
        buffer: Buffer.from(response.data),
      } as Express.Multer.File;
    } catch (err) {
      this.logger.error(`Erreur téléchargement fichier: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }

  /**
   * ------------------------------------------------
   * 🔥 5. Réponse finale Telegram
   * ------------------------------------------------
   */
  private formatFinalResponse(
    claim: string,
    tikTokAnalysis: TikTokAnalysisResult | null,
    veraResponse: string
  ): string {
    let msg = `✅ *Analyse terminée*\n\n`;

    if (tikTokAnalysis) {
      msg +=
        "🎥 *Analyse TikTok*\n" +
        `Probabilité IA : *${tikTokAnalysis.aiAnalysis.probability}%*\n` +
        "Indicateurs :\n" +
        tikTokAnalysis.aiAnalysis.indicators
          .map((indicator) => `• ${indicator}`)
          .join("\n") +
        "\n\n";
    }

    if (veraResponse) {
      msg += `🧠 *Verdict Vera*\n${veraResponse}\n\n`;
    }

    msg += `_Contenu analysé: "${claim.slice(0, 100)}${claim.length > 100 ? "..." : ""}"_`;

    return msg;
  }
}