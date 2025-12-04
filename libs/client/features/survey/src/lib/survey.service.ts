import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SurveyService {

  private api = 'http://localhost:3000/api/survey';

  constructor(private http: HttpClient) {}

  getStats(sheetId: string) {
    return this.http.get(`${this.api}/${sheetId}/stats`);
  }
  
  getAllSurveys() {
    return this.http.get<{ sheetId: string; title: string }[]>(`${this.api}/all`);
  }

  importSurvey(sheetId: string) {
    return this.http.get(`${this.api}/import/${sheetId}`);
  }

}
