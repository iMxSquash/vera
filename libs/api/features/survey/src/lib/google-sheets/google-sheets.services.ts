import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';

@Injectable()
export class GoogleSheetsService {
  private sheets;

  constructor() {
    const keyFile = path.join(process.cwd(), 'apps/server/google-credentials.json');

    const auth = new google.auth.GoogleAuth({
      keyFile,
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
