import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // ← Ajout de Router
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
  loadingId: string | null = null;

  constructor(private surveyService: SurveyService, private router: Router) {} // ← Router injecté

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

  refreshSurvey(sheetId: string) {
    this.loadingId = sheetId;
    this.surveyService.importSurvey(sheetId).subscribe({
      next: () => {
        this.surveyService.getStats(sheetId).subscribe(stats => {
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

  /** Méthode pour savoir si une route est active pour la nav */
  isActive(url: string): boolean {
    return this.router.url === url;
  }

}
