import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { GoogleSheetsService } from './google-sheets/google-sheets.services';
import { error } from 'node:console';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    private readonly googleSheets: GoogleSheetsService,
  ) {}

  // Récupérer toutes les réponses d’un sondage (par sheetId)
  async findBySheet(sheetId: string) {
    return this.surveyRepository.find({
      where: { sheetId },
      order: { created_at: 'DESC' },
    });
  }

  // Importer un Google Sheet en BDD
  async importFromGoogleSheet(sheetId: string) {
  try {
    // 1) Lire les données du sheet
    const rows = await this.googleSheets.readSheet(sheetId, 'form1!A:B');

    if (!rows || rows.length < 2) {
      throw new Error("Aucune donnée valide trouvée dans le Google Sheet.");
    }

    // 🔥 2) Récupérer automatiquement le titre
    const title = await this.googleSheets.getSheetTitle(sheetId);

    // 3) Construire les nouvelles entrées
    const newEntries = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const [timestampStr, q1] = row;

      let parsedDate = new Date(timestampStr);
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date();
      }

      newEntries.push({
        sheetId,
        title,            // 👈🔥 AJOUT DU TITRE ICI
        q1,
        created_at: parsedDate,
      });
    }

    // 4) Suppression sécurisée
    await this.surveyRepository.delete({ sheetId });

    // 5) Sauvegarde finale
    await this.surveyRepository.save(newEntries);

    return { imported: newEntries.length, title };

  } catch (err) {
    console.error("❌ Échec import Google Sheet :", err);
    return {
      imported: 0,
      error: "Erreur",
      safe: "Anciennes données conservées"
    };
  }
}

async findAllSurveys() {
  return this.surveyRepository
    .createQueryBuilder("s")
    .select("s.sheetId", "sheetId")
    .addSelect("s.title", "title")
    .where("s.sheetId IS NOT NULL")
    .groupBy("s.sheetId, s.title")
    .getRawMany();
}

async cleanup() {
  return this.surveyRepository
    .createQueryBuilder()
    .delete()
    .from(Survey)
    .where("sheetId IS NULL")
    .execute();
}


  //Récuperer les stats
  async getStats(sheetId: string) {
  const responses = await this.findBySheet(sheetId);

  if (responses.length === 0) {
    return {
      total: 0,
      yes: 0,
      no: 0,
      percentYes: 0,
      percentNo: 0,
    };
  }

  const yesCount = responses.filter(r => r.q1.toLowerCase() === 'oui').length;
  const noCount = responses.length - yesCount;

  const percentYes = Math.round((yesCount / responses.length) * 100);
  const percentNo = Math.round((noCount / responses.length) * 100);

  return {
    total: responses.length,
    yes: yesCount,
    no: noCount,
    percentYes,
    percentNo,
  };
}


}
