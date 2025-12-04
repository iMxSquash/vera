import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SurveyService } from '@client/features/survey';
import { SurveyChartComponent } from '@client/features/survey';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SurveyChartComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

  surveys: { sheetId: string; title: string; stats: any }[] = [];

  constructor(private surveyService: SurveyService) {}

  ngOnInit(): void {
    this.loadSurveys();
  }

  loadSurveys() {
    this.surveyService.getAllSurveys().subscribe(rows => {

      this.surveys = [];

      rows.forEach(row => {
        this.surveyService.getStats(row.sheetId).subscribe(stats => {

          this.surveys.push({
            sheetId: row.sheetId,
            title: row.title,
            stats
          });

        });
      });

    });
  }


  loadingId: string | null = null;

  refreshSurvey(sheetId: string) {
    this.loadingId = sheetId;

    this.surveyService.importSurvey(sheetId).subscribe({
      next: () => {
        // Mise à jour des stats après import
        this.surveyService.getStats(sheetId).subscribe(stats => {
          // Remplace les anciennes stats
          const index = this.surveys.findIndex(s => s.sheetId === sheetId);
          if (index !== -1) {
            this.surveys[index].stats = stats;
          }
          this.loadingId = null;
          alert("Les données du sondage ont été mises à jour !");
        });
      },
      error: (err) => {
        console.error("Erreur import :", err);
        this.loadingId = null;
        alert("Erreur lors de la mise à jour du sondage.");
      }
    });
  }

}