import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

@NgModule({
  imports: [CommonModule, DashboardComponent],
  exports: [DashboardComponent],
})
export class AdminModule {}
