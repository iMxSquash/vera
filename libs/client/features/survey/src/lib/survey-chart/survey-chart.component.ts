import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);


@Component({
  selector: 'app-survey-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './survey-chart.component.html',
})
export class SurveyChartComponent implements OnChanges {

  @Input() stats!: any;

  public chartType: ChartType = 'doughnut';

  public chartData: ChartData<'doughnut'> = {
    labels: ['Oui', 'Non'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4CAF50', '#F44336'],
        hoverBackgroundColor: ['#66BB6A', '#EF5350'],
        borderWidth: 1,
      }
    ]
  };

  public chartOptions:any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 }
        }
      }
    }
  };

  ngOnChanges(): void {
    if (this.stats) {
      this.chartData.datasets[0].data = [
        this.stats.percentYes,
        this.stats.percentNo
      ];
    }
    console.log("STATS REÇUES", this.stats);

  }
}
