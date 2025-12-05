import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  private sheets;

  constructor(private readonly configService: ConfigService) {
    // Récupérer et parser les credentials depuis la variable d'environnement
    const credentialsJson = this.configService.get<string>('GOOGLE_CREDENTIALS');
    
    if (!credentialsJson) {
      throw new Error('GOOGLE_CREDENTIALS environment variable is not set');
    }

    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  async readSheet(sheetId: string, range: string) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    return response.data.values ?? [];
  }

  async getSheetTitle(sheetId: string): Promise<string> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      includeGridData: false,
    });

    return response.data.properties?.title ?? "Sondage";
  }
}
