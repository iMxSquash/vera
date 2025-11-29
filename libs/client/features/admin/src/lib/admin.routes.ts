import { Route } from '@angular/router';
import { AdminShellComponent } from './shell/admin-shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ReferenceImagesComponent } from './pages/reference-images/reference-images.component';

export const routes: Route[] = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'reference-images',
        component: ReferenceImagesComponent,
      },
    ],
  },
];
