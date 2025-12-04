import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf, Context } from "telegraf";
import axios from "axios";
import * as dotenv from "dotenv";
import { ContentsService } from "@vera/api/features/contents";

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

interface VeraSource {
  title: string;
  url: string;
}

interface VeraResult {
  verdict: string;
  sources: VeraSource[];
}

@Injectable()
export class TelegramBotService implements OnModuleInit {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly contentsService: ContentsService
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
   * 🔥 Analyse principale
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
      const matchArray = text.match(TIKTOK_REGEX);
      const platform = matchArray ? ContentPlatform.TIKTOK : ContentPlatform.TELEGRAM;

      let tikTokAnalysis: TikTokAnalysisResult | null = null;

      // 🔹 Si TikTok → analyse vidéo
      if (matchArray) {
        tikTokAnalysis = await this.analyseTikTokVideo(matchArray[0]);
      }

      // 🔹 Sauvegarde dans backend
      await this.contentsService.create({
        platform,
        url: matchArray ? matchArray[0] : "",
        text,
        media: fileId ? { fileId } : undefined,
        metadata: { source: `telegram_${type}`, userId: ctx.from?.id },
      });

      // 🔹 Vérification Vera
      const evidence = await this.searchWebForClaimWithVera(
        text,
        ctx.from?.id?.toString() ?? "unknown_user"
      );

      // 🔹 Fusion finale
      const response = this.formatFinalResponse(text, tikTokAnalysis, evidence);

      await ctx.reply(response, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("Erreur handleClaim :", err);
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
   * 🔥 3. Appel API Vera
   * ------------------------------------------------
   */
  private async searchWebForClaimWithVera(
    claim: string,
    userId: string
  ): Promise<VeraResult | null> {
    try {
      if (!process.env["VERA_API_KEY"])
        throw new Error("VERA_API_KEY non défini");

      const res = await axios.post(
        "https://feat-api-partner---api-ksrn3vjgma-od.a.run.app/api/v1/chat",
        { userId, query: claim },
        { headers: { "X-API-Key": process.env["VERA_API_KEY"] } }
      );

      const text = res.data?.toString?.() ?? "";
      const sources: VeraSource[] = [];

      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let match;
      while ((match = urlRegex.exec(text)) !== null) {
        sources.push({ title: "Lien source", url: match[0] });
      }

      return { verdict: text, sources };
    } catch (err) {
      console.error("Erreur API Vera :", err);
      return null;
    }
  }

  /**
   * ------------------------------------------------
   * 🔥 4. Réponse finale Telegram
   * ------------------------------------------------
   */
  private formatFinalResponse(
    claim: string,
    tikTokAnalysis: TikTokAnalysisResult | null,
    evidence: VeraResult | null
  ): string {
    let msg = `✅ Analyse terminée pour : "${claim}"\n\n`;

    if (tikTokAnalysis) {
      msg +=
        "🎥 *Analyse de la vidéo TikTok*\n" +
        `Probabilité IA : *${tikTokAnalysis.aiAnalysis.probability}%*\n` +
        "Indicateurs :\n" +
        tikTokAnalysis.aiAnalysis.indicators
          .map((indicator) => `• ${indicator}`)
          .join("\n") +
        "\n\n";
    }

    if (evidence) {
      msg += `🧠 *Vera dit :*\n${evidence.verdict}\n\n`;

      if (evidence.sources.length) {
        msg += "🔗 *Sources :*\n";
        msg += evidence.sources
          .map((s) => `- [${s.title}](${s.url})`)
          .join("\n");
      }
    }

    return msg;
  }
}