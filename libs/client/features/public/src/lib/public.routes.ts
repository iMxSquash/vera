import { Route } from '@angular/router';
import { PublicShellComponent } from './shell/public-shell.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Route[] = [
  {
    path: '',
    component: PublicShellComponent,
    children: [
      {
        path: '',
        component: LandingComponent,
      },
    ],
  },
];
